import json
import string
from collections import namedtuple

from common.tests import BaseTestCase
from common.utils import get_random_name

from request.tests import create_request
from library_sample_shared.tests import create_index_type as _create_index_type
from library.tests import create_library
from sample.tests import create_sample

from library_sample_shared.models import (
    ReadLength,
    IndexType,
    IndexI7,
    IndexI5,
    IndexPair,
)
from library.models import Library
from sample.models import Sample

from .models import Pool, PoolSize
from .index_generator import IndexRegistry, IndexGenerator


Index = namedtuple('Index', ['prefix', 'number', 'index'])

# Single tube indices

INDICES_1 = [  # I7: Best match: A02 and A03
    Index('A', '01', 'AAAAAA'),
    Index('A', '02', 'ATCACG'),
    Index('A', '03', 'TAGTGC'),
]

INDICES_2 = [  # I7
    Index('B', '01', 'AAAAAA'),
    Index('B', '02', 'ATCACG'),
    Index('B', '03', 'TAGTGC'),
]
INDICES_3 = [  # I5
    Index('C', '01', 'AAAAAA'),
    Index('C', '02', 'ATCACG'),
    Index('C', '03', 'TAGTGC'),
]

INDICES_4 = [  # I7
    Index('D', '01', 'ACACAC'),
    Index('D', '02', 'CACACA'),
]

INDICES_5 = [  # I7: Best match: E01 and E03
    Index('E', '01', 'AACCAA'),
    Index('E', '02', 'CCAACC'),
    Index('E', '03', 'AATTAA'),
]
INDICES_6 = [  # I5
    Index('F', '01', 'CCAACC'),
    Index('F', '02', 'AACCAA'),
]

# Index Pair indices (plate 3x3)

INDICES_7 = [  # I7
    Index('G', '01', 'CATCGC'),
    Index('G', '02', 'GTTTGT'),
    Index('G', '03', 'GTAGTT'),
]
INDICES_8 = [  # I5
    Index('H', '01', 'CTCGGG'),
    Index('H', '02', 'CACCGT'),
    Index('H', '03', 'TAAATC'),
]


def create_pool(user, multiplier=1, size=200, save=True):
    pool_size = PoolSize(multiplier=multiplier, size=size)
    pool_size.save()

    pool = Pool(user=user, size=pool_size)

    if save:
        pool.save()

    return pool


def create_index_type(indices_i7, indices_i5=None, format='single'):
    is_dual = indices_i5 is not None

    index_type = IndexType(
        name=get_random_name(),
        is_dual=is_dual,
        format=format,
        index_length='6',
    )
    index_type.save()

    for idx in indices_i7:
        index = IndexI7(
            prefix=idx.prefix, number=idx.number, index=idx.index)
        index.save()
        index_type.indices_i7.add(index)

    if indices_i5:
        for idx in indices_i5:
            index = IndexI5(
                prefix=idx.prefix, number=idx.number, index=idx.index)
            index.save()
            index_type.indices_i5.add(index)

    if format == 'plate':
        indices_i7 = index_type.indices_i7.all()
        indices_i5 = index_type.indices_i5.all()
        length = len(indices_i7)

        for i, char_coord in enumerate(list(string.ascii_uppercase)[:length]):
            for j, num_coord in enumerate(range(1, length + 1)):
                index_pair = IndexPair(
                    index_type=index_type,
                    index1=indices_i7[j],
                    index2=indices_i5[i],
                    char_coord=char_coord,
                    num_coord=num_coord,
                )
                index_pair.save()

    return index_type


# Models

class TestPoolModel(BaseTestCase):
    def setUp(self):
        self.user = self.create_user('test@test.io', 'foo-bar')
        self.pool = create_pool(self.user)

        library = create_library(get_random_name(), 2)
        sample = create_sample(get_random_name(), 2)
        self.pool.libraries.add(library)
        self.pool.samples.add(sample)

    def test_pool_name(self):
        self.assertEqual(str(self.pool), self.pool.name)
        self.assertEqual(self.pool.name, f'Pool_{self.pool.pk}')

    def test_total_sequencing_depth(self):
        self.assertEqual(self.pool.total_sequencing_depth, 2)

    def test_update_library(self):
        """
        When a library is added to a pool, ensure its is_pooled is set to True.
        """
        library = create_library(get_random_name(), 2)
        self.pool.libraries.add(library)
        library = library.__class__.objects.get(pk=library.pk)
        self.assertTrue(library.is_pooled)

    def test_update_sample(self):
        """
        When a sample is added to a pool, ensure its is_pooled and is_converted
        are set to True, and the barcode is updated.
        """
        sample = create_sample(get_random_name(), 2)
        self.assertNotIn('L', sample.barcode)
        self.pool.samples.add(sample)
        sample = sample.__class__.objects.get(pk=sample.pk)
        self.assertTrue(sample.is_pooled)
        self.assertTrue(sample.is_converted)
        self.assertIn('L', sample.barcode)


class TestPoolSizeModel(BaseTestCase):
    def setUp(self):
        self.size = PoolSize(multiplier=1, size=200)
        self.size.save()

    def test_name(self):
        self.assertEqual(
            str(self.size), f'{self.size.multiplier}x{self.size.size}')


# Views

class TestPoolSize(BaseTestCase):
    def setUp(self):
        self.create_user('test@test.io', 'foo-bar')
        self.client.login(email='test@test.io', password='foo-bar')

    def test_pool_size_list(self):
        """ Ensure get pool sizes behaves correctly. """
        pool_size = PoolSize(multiplier=1, size=10)
        pool_size.save()

        response = self.client.get('/api/pool_sizes/')
        self.assertEqual(response.status_code, 200)
        pool_sizes = [x['id'] for x in response.json()]
        self.assertIn(pool_size.pk, pool_sizes)


class TestRecordsList(BaseTestCase):
    def setUp(self):
        self.user = self.create_user()
        self.login()

    def test_get_libraries_and_samples_list(self):
        """
        Ensure get libraries and samples ready for pooling list
        behaves correctly.
        """
        library1 = create_library(get_random_name(), 2)
        library2 = create_library(get_random_name(), 1)
        library3 = create_library(get_random_name(), 2)  # no index i7
        sample1 = create_sample(get_random_name(), -2)
        sample2 = create_sample(get_random_name(), -1)

        library1.index_i7 = 'AGTCAA'
        library2.index_i7 = 'AGTCAA'
        library1.save()
        library2.save()

        req = create_request(self.user)
        req.libraries.add(*[library1.pk, library2.pk, library3.pk])
        req.samples.add(*[sample1.pk, sample2.pk])

        response = self.client.get('/api/index_generator/')
        self.assertEqual(response.status_code, 200)
        records = [x['name'] for x in response.json()]
        self.assertIn(library1.name, records)
        self.assertIn(sample1.name, records)
        self.assertNotIn(library2.name, records)
        self.assertNotIn(library3.name, records)
        self.assertNotIn(sample2.name, records)

    def test_get_libraries_and_samples_list_non_staff(self):
        """Ensure error is thrown if a non-staff user tries to get the list."""
        self.create_user('non-staff@test.io', 'test', False)
        self.login('non-staff@test.io', 'test')
        response = self.client.get('/api/index_generator/')
        self.assertTrue(response.status_code, 403)

    def test_update_record(self):
        """ Ensure update library/samples behaves correctly. """
        library = create_library(get_random_name(), 2)
        sample = create_sample(get_random_name(), 2)

        read_length = ReadLength(name=get_random_name())
        read_length.save()

        response = self.client.post('/api/index_generator/edit/', {
            'data': json.dumps([{
                'pk': library.pk,
                'record_type': 'Library',
                'read_length': read_length.pk,
            }, {
                'pk': sample.pk,
                'record_type': 'Sample',
                'read_length': read_length.pk,
            }])
        })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])

        updated_library = Library.objects.get(pk=library.pk)
        updated_sample = Sample.objects.get(pk=sample.pk)
        self.assertEqual(updated_library.read_length, read_length)
        self.assertEqual(updated_sample.read_length, read_length)

    def test_update_record_contains_invalid(self):
        """
        Ensure update library/sample containing invalid objects
        behaves correctly.
        """
        library = create_library(get_random_name(), 2)
        sample = create_sample(get_random_name(), 2)

        index_type = IndexType(name=get_random_name())
        index_type.save()

        response = self.client.post('/api/index_generator/edit/', {
            'data': json.dumps([{
                'pk': library.pk,
                'record_type': 'Library',
                'index_type': index_type.pk,
            }, {
                'pk': sample.pk,
                'record_type': 'Sample',
                'index_type': index_type.pk,
            }])
        })

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['message'], 'Some records cannot be updated.')

        updated_library = Library.objects.get(pk=library.pk)
        updated_sample = Sample.objects.get(pk=sample.pk)
        self.assertEqual(updated_library.index_type, library.index_type)
        self.assertEqual(updated_sample.index_type, index_type)


class TestIndexRegistry(BaseTestCase):
    def setUp(self):
        self.index_type1 = create_index_type(INDICES_1)
        self.index_type2 = create_index_type(INDICES_7, INDICES_8, 'plate')

    def test_format_tube(self):
        index_registry = IndexRegistry('single', 'single', [self.index_type1])
        self.assertEqual(len(index_registry.indices.keys()), 1)
        self.assertIn(self.index_type1.pk, index_registry.indices.keys())
        self.assertEqual(
            len(index_registry.indices[self.index_type1.pk]['i7']), 3)
        self.assertEqual(
            len(index_registry.indices[self.index_type1.pk]['i5']), 0)

    def test_format_plate(self):
        index_registry = IndexRegistry('plate', 'dual', [self.index_type2])
        pairs = index_registry.pairs[self.index_type2.pk]
        self.assertEqual(len(pairs), 9)
        coordinates = [x.coordinate for x in pairs]
        self.assertEqual(coordinates, [
            'A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'])

    def test_format_plate_filter_by_start_coord(self):
        index_registry = IndexRegistry(
            'plate', 'dual', [self.index_type2], 'B2')
        self.assertEqual(len(index_registry.pairs[self.index_type2.pk]), 4)

    def test_format_plate_direction_down(self):
        index_registry = IndexRegistry(
            'plate', 'dual', [self.index_type2], 'B2', 'down')
        coordinates = [
            x.coordinate for x in index_registry.pairs[self.index_type2.pk]]
        self.assertEqual(coordinates, ['B2', 'C2', 'B3', 'C3'])

    def test_invalid_start_coordinate(self):
        with self.assertRaises(ValueError) as context:
            IndexRegistry('plate', 'dual', [self.index_type2], 'test')
        self.assertEqual(str(context.exception), 'Invalid start coordinate.')

    def test_no_index_pairs(self):
        with self.assertRaises(ValueError) as context:
            IndexRegistry('plate', 'dual', [self.index_type2], 'Z50')
        self.assertIn('No index pairs', str(context.exception))


class TestIndexGenerator(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.login()

        self.read_length = ReadLength(name=get_random_name())
        self.read_length.save()

        self.index_type1 = create_index_type(INDICES_1)
        self.index_type2 = create_index_type(INDICES_2, INDICES_3)
        self.index_type3 = create_index_type(INDICES_4)
        self.index_type4 = create_index_type(INDICES_5, INDICES_6)

        self.index_type5 = create_index_type(INDICES_7, INDICES_8, 'plate')

    # Test valid data

    def test_one_sample_format_tube_mode_single(self):
        """ Generate index for one sample (format=tube, mode=single). """
        sample = create_sample(
            get_random_name(), index_type=self.index_type1)
        index_i7_ids = [x.index_id_ for x in self.index_type1.indices_i7.all()]

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 1)
        self.assertIn(data['data'][0]['index_i7_id'], index_i7_ids)

    def test_one_sample_format_tube_mode_dual(self):
        sample = create_sample(
            get_random_name(), index_type=self.index_type2)
        index_i7_ids = [x.index_id_ for x in self.index_type2.indices_i7.all()]
        index_i5_ids = [x.index_id_ for x in self.index_type2.indices_i5.all()]

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 1)
        self.assertIn(data['data'][0]['index_i7_id'], index_i7_ids)
        self.assertIn(data['data'][0]['index_i5_id'], index_i5_ids)

    def test_two_samples_format_tube_mode_single(self):
        index_i7_ids = [x.index_id_ for x in self.index_type1.indices_i7.all()]

        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type1,
        )
        sample2 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type1,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
        self.assertIn(data['data'][0]['index_i7_id'], index_i7_ids)
        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)

    def test_two_samples_format_tube_mode_dual(self):
        index_i7_ids = [x.index_id_ for x in self.index_type2.indices_i7.all()]
        index_i5_ids = [x.index_id_ for x in self.index_type2.indices_i5.all()]

        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type2,
        )
        sample2 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type2,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
        self.assertIn(data['data'][0]['index_i7_id'], index_i7_ids)
        self.assertIn(data['data'][0]['index_i5_id'], index_i5_ids)
        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)
        self.assertIn(data['data'][1]['index_i5_id'], index_i5_ids)

    # def test_samples_format_plate_mode_dual(self):
    #     sample1 = create_sample(
    #         get_random_name(),
    #         read_length=self.read_length,
    #         index_type=self.index_type5,
    #     )
    #     sample2 = create_sample(
    #         get_random_name(),
    #         read_length=self.read_length,
    #         index_type=self.index_type5,
    #     )

    #     response = self.client.post('/api/index_generator/generate_indices/', {
    #         'samples': json.dumps([sample1.pk, sample2.pk]),
    #     })
    #     data = response.json()
    #     import pdb; pdb.set_trace()
    #     self.assertEqual(response.status_code, 200)
    #     self.assertTrue(data['success'])
    #     self.assertEqual(len(data['data']), 2)

    def test_libraries_and_samples_format_tube_mode_single(self):
        library = create_library(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type1,
        )
        library.index_i7 = INDICES_1[1].index
        library.save()

        sample = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type1,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'libraries': json.dumps([library.pk]),
            'samples': json.dumps([sample.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
        self.assertEqual(data['data'][0]['index_i7_id'], 'A02')
        self.assertEqual(data['data'][1]['index_i7_id'], 'A03')

    def test_libraries_and_samples_format_tube_mode_dual(self):
        library = create_library(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type2,
        )
        library.index_i7 = INDICES_2[1].index
        library.index_i5 = INDICES_3[2].index
        library.save()

        sample = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type2,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'libraries': json.dumps([library.pk]),
            'samples': json.dumps([sample.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
        self.assertEqual(data['data'][0]['index_i7_id'], 'B02')
        self.assertEqual(data['data'][0]['index_i5_id'], 'C03')
        self.assertEqual(data['data'][1]['index_i7_id'], 'B03')
        self.assertEqual(data['data'][1]['index_i5_id'], 'C02')

    def test_custom_index_i7_library(self):
        """
        Ensure index generation with types (not selected) indices
        behaves correctly.
        """
        index_type = _create_index_type(get_random_name(), index_length='6')
        library = create_library(
            get_random_name(),
            read_length=self.read_length,
            index_type=index_type,
        )
        library.index_i7 = INDICES_1[1].index
        library.save()

        sample = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type1,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'libraries': json.dumps([library.pk]),
            'samples': json.dumps([sample.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
        self.assertEqual(data['data'][0]['index_i7_id'], '')
        self.assertEqual(data['data'][1]['index_i7_id'], 'A03')

    # Test failing data

    def test_failing_best_pair_format_tube_mode_single(self):
        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type3,
        )
        sample2 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type3,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('best matching pair of Indices I7', data['message'])
        self.assertIn(sample1.name, data['message'])
        self.assertIn(sample2.name, data['message'])

    def test_failing_best_pair_format_tube_mode_dual(self):
        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type4,
        )
        sample2 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type4,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('best matching pair of Indices I5', data['message'])
        self.assertIn(sample1.name, data['message'])
        self.assertIn(sample2.name, data['message'])

    # Test data validation

    def test_no_samples(self):
        """ Ensure error is thrown if no samples have been provided. """
        response = self.client.post('/api/index_generator/generate_indices/')
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'No samples provided.')

    def test_read_length(self):
        """ Ensure error is thrown if Read Length is not the same. """
        library = create_library(get_random_name())
        sample = create_sample(get_random_name())

        response = self.client.post('/api/index_generator/generate_indices/', {
            'libraries': json.dumps([library.pk]),
            'samples': json.dumps([sample.pk]),
        })
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'Read Length must be the same ' +
                         'for all libraries and samples.')

    def test_index_type_not_set(self):
        """ Ensure error is thrown if Index Type is not set. """
        index_type = _create_index_type(get_random_name())
        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=index_type,
        )
        sample2 = create_sample(
            get_random_name(), read_length=self.read_length)

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'Index Type must be set ' +
                         'for all libraries and samples.')

    def test_mixed_single_dual_indices(self):
        """
        Ensure error is thrown if mixed single/dual indices have been used.
        """
        index_type1 = _create_index_type(get_random_name())
        index_type2 = _create_index_type(get_random_name(), is_dual=True)

        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=index_type1,
        )
        sample2 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=index_type2,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(
            data['message'], 'Mixed single/dual indices are not allowed.')

    def test_mixed_index_lengths(self):
        """
        Ensure error is thrown if index types with mixed index lengths
        have been used.
        """
        index_type1 = _create_index_type(get_random_name())
        index_type2 = _create_index_type(get_random_name(), index_length='6')

        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=index_type1,
        )
        sample2 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=index_type2,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'Index Types with mixed index ' +
                         'lengths are not allowed.')

    def test_mixed_formats(self):
        """ Ensure error is thrown if mixed formats have been used. """
        index_type1 = _create_index_type(get_random_name())
        index_type2 = _create_index_type(get_random_name(), format='plate')

        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=index_type1,
        )
        sample2 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=index_type2,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'Index Types with mixed formats ' +
                         'are not allowed.')

    def test_mixed_index_types_format_plate(self):
        index_type1 = _create_index_type(get_random_name(), format='plate')
        index_type2 = _create_index_type(get_random_name(), format='plate')

        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=index_type1,
        )
        sample2 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=index_type2,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'Index Type must be the same for ' +
                         'all libraries and samples if the format is "plate".')

    # Test static methods

    def test_index_convertion(self):
        converted_index = IndexGenerator.convert_index('ATCACG')
        self.assertEqual(converted_index, 'RGRRRG')

    def test_index_dict_creation(self):
        index_dict = IndexGenerator.create_index_dict()
        self.assertEqual(index_dict, {
            'index_type': '', 'prefix': '', 'number': '', 'index': ''
        })

    def test_result_dict_creation(self):
        sample = create_sample(get_random_name())
        result_dict = IndexGenerator.create_result_dict(sample, {}, {})
        self.assertEqual(result_dict, {
            'pk': sample.pk,
            'name': sample.name,
            'record_type': 'Sample',
            'read_length': sample.read_length_id,
            'sequencing_depth': sample.sequencing_depth,
            'index_i7': {},
            'index_i5': {},
        })
