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

INDICES_1 = [  # I7
    Index('A', '01', 'GTAAAT'),
    Index('A', '02', 'TACGTT'),
    Index('A', '03', 'CGTTTA'),
    Index('A', '04', 'ATGTGG'),
    Index('A', '05', 'GGCGCT'),
    Index('A', '06', 'CGATCC'),
]

INDICES_2 = [  # I7
    Index('B', '01', 'GTAAAT'),
    Index('B', '02', 'TACGTT'),
    Index('B', '03', 'CGTTTA'),
]
INDICES_3 = [  # I5
    Index('C', '01', 'TCGGCC'),
    Index('C', '02', 'AAACGA'),
    Index('C', '03', 'GGTGCG'),
]

INDICES_4 = [  # I7
    Index('D', '01', 'ACACAC'),
    Index('D', '02', 'CACACA'),
]

INDICES_5 = [  # I7
    Index('E', '01', 'AACCAA'),
    Index('E', '02', 'CCAACC'),
    Index('E', '03', 'AATTAA'),
]
INDICES_6 = [  # I5
    Index('F', '01', 'CCAACC'),
    Index('F', '02', 'AACCAA'),
]

# Index Pair indices (plate 3x3)
# G01-H01, G02-H01, G03-H01
# G01-H02, G02-H02, G03-H02
# G01-H03, G02-H03, G03-H03

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

# Index Pair indices (plate 2x3)

INDICES_9 = [  # I7
    Index('I', '01', 'GTAAAT'),
    Index('I', '02', 'TACGTT'),
    Index('I', '03', 'CGTTTA'),
    Index('I', '04', 'ATGTGG'),
    Index('I', '05', 'GGCGCT'),
    Index('I', '06', 'CGATCC'),
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

    if indices_i5 is not None and format == 'plate':
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

        # format 'plate', mode 'single'
        self.index_type3 = create_index_type(INDICES_9)
        for i, index in enumerate(self.index_type3.indices_i7.all()):
            char_coord = 'A' if i < 3 else 'B'
            num_coord = i % 3 + 1
            index_pair = IndexPair(
                index_type=self.index_type3,
                index1=index,
                char_coord=char_coord,
                num_coord=num_coord,
            )
            index_pair.save()

    def test_format_tube(self):
        index_registry = IndexRegistry('single', 'single', [self.index_type1])
        self.assertEqual(len(index_registry.indices.keys()), 1)
        self.assertIn(self.index_type1.pk, index_registry.indices.keys())
        self.assertEqual(
            len(index_registry.indices[self.index_type1.pk]['i7']), 6)
        self.assertEqual(
            len(index_registry.indices[self.index_type1.pk]['i5']), 0)

    def test_format_plate_mode_single(self):
        index_registry = IndexRegistry('plate', 'single', [self.index_type3])
        pairs = index_registry.pairs[self.index_type3.pk]
        self.assertEqual(len(pairs), 6)
        coordinates = [x.coordinate for x in pairs]
        self.assertEqual(coordinates, ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'])

    def test_format_plate_mode_dual(self):
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

        self.pool_size = PoolSize(multiplier=1, size=200)
        self.pool_size.save()

        self.read_length = ReadLength(name=get_random_name())
        self.read_length.save()

        self.index_type1 = create_index_type(INDICES_1)
        self.index_type2 = create_index_type(INDICES_2, INDICES_3)
        self.index_type3 = create_index_type(INDICES_4)
        self.index_type4 = create_index_type(INDICES_5, INDICES_6)

        self.index_type5 = create_index_type(INDICES_7, INDICES_8, 'plate')

        self.index_type6 = create_index_type(INDICES_9, None, 'plate')
        for i, index in enumerate(self.index_type6.indices_i7.all()):
            char_coord = 'A' if i < 3 else 'B'
            num_coord = i % 3 + 1
            index_pair = IndexPair(
                index_type=self.index_type6,
                index1=index,
                char_coord=char_coord,
                num_coord=num_coord,
            )
            index_pair.save()

    # Test valid data

    def test_save_pool(self):
        library = create_library(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type1,
        )
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

        self.assertEqual(sample1.index_i7, None)
        self.assertEqual(sample2.index_i7, None)

        response = self.client.post('/api/index_generator/save_pool/', {
            'pool_size_id': self.pool_size.pk,
            'libraries': json.dumps([
                {
                    'pk': library.pk,
                }
            ]),
            'samples': json.dumps([
                {
                    'pk': sample1.pk,
                    'index_i7': INDICES_1[1].index,
                    'index_i5': '',
                },
                {
                    'pk': sample2.pk,
                    'index_i7': INDICES_1[2].index,
                    'index_i5': '',
                }
            ]),
        })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])

        update_sample1 = Sample.objects.get(pk=sample1.pk)
        update_sample2 = Sample.objects.get(pk=sample2.pk)
        self.assertEqual(update_sample1.index_i7, INDICES_1[1].index)
        self.assertEqual(update_sample2.index_i7, INDICES_1[2].index)
        self.assertEqual(Pool.objects.filter(
            libraries__id__in=[library.pk],
            samples__id__in=[sample1.pk, sample2.pk]
        ).distinct().count(), 1)

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

    def test_one_sample_format_plate_mode_single(self):
        index_i7_ids = [x.index_id_ for x in self.index_type6.indices_i7.all()]

        sample = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type6,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 1)
        self.assertIn(data['data'][0]['index_i7_id'], index_i7_ids)
        self.assertEqual(data['data'][0]['index_i5_id'], '')

        index_i7 = IndexI7.objects.get(
            index_type=self.index_type6,
            index=data['data'][0]['index_i7']['index'],
        )
        self.assertEqual(IndexPair.objects.filter(
            index1=index_i7, index2=None).count(), 1)

    def test_one_sample_format_plate_mode_dual(self):
        index_i7_ids = [x.index_id_ for x in self.index_type5.indices_i7.all()]
        index_i5_ids = [x.index_id_ for x in self.index_type5.indices_i5.all()]

        sample = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type5,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 1)

        self.assertIn(data['data'][0]['index_i7_id'], index_i7_ids)
        self.assertIn(data['data'][0]['index_i5_id'], index_i5_ids)

        index_i7 = IndexI7.objects.get(
            index_type=self.index_type5,
            index=data['data'][0]['index_i7']['index'],
        )
        index_i5 = IndexI5.objects.get(
            index_type=self.index_type5,
            index=data['data'][0]['index_i5']['index'],
        )

        self.assertEqual(IndexPair.objects.filter(
            index1=index_i7, index2=index_i5).count(), 1)

    def test_two_samples_format_plate_mode_single(self):
        index_i7_ids = [x.index_id_ for x in self.index_type6.indices_i7.all()]

        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type6,
        )
        sample2 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type6,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)

        self.assertIn(data['data'][0]['index_i7_id'], index_i7_ids)
        self.assertEqual(data['data'][0]['index_i5_id'], '')
        index_i7 = IndexI7.objects.get(
            index_type=self.index_type6,
            index=data['data'][0]['index_i7']['index'],
        )
        self.assertEqual(IndexPair.objects.filter(
            index1=index_i7, index2=None).count(), 1)

        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)
        self.assertEqual(data['data'][1]['index_i5_id'], '')
        index_i7 = IndexI7.objects.get(
            index_type=self.index_type6,
            index=data['data'][1]['index_i7']['index'],
        )
        self.assertEqual(IndexPair.objects.filter(
            index1=index_i7, index2=None).count(), 1)

    def test_two_samples_format_plate_mode_dual(self):
        index_i7_ids = [x.index_id_ for x in self.index_type5.indices_i7.all()]
        index_i5_ids = [x.index_id_ for x in self.index_type5.indices_i5.all()]

        sample1 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type5,
        )
        sample2 = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type5,
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
        index_i7 = IndexI7.objects.get(
            index_type=self.index_type5,
            index=data['data'][0]['index_i7']['index'],
        )
        index_i5 = IndexI5.objects.get(
            index_type=self.index_type5,
            index=data['data'][0]['index_i5']['index'],
        )
        self.assertEqual(IndexPair.objects.filter(
            index1=index_i7, index2=index_i5).count(), 1)

        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)
        self.assertIn(data['data'][1]['index_i5_id'], index_i5_ids)
        index_i7 = IndexI7.objects.get(
            index_type=self.index_type5,
            index=data['data'][1]['index_i7']['index'],
        )
        index_i5 = IndexI5.objects.get(
            index_type=self.index_type5,
            index=data['data'][1]['index_i5']['index'],
        )
        self.assertEqual(IndexPair.objects.filter(
            index1=index_i7, index2=index_i5).count(), 1)

    def test_libraries_and_samples_format_tube_mode_single(self):
        index_i7_ids = [x.index_id_ for x in self.index_type1.indices_i7.all()]

        library = create_library(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type1,
        )
        library.index_i7 = INDICES_1[0].index
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
        self.assertEqual(data['data'][0]['index_i7_id'], 'A01')
        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)

    def test_libraries_and_samples_format_tube_mode_dual(self):
        index_i7_ids = [x.index_id_ for x in self.index_type2.indices_i7.all()]
        index_i5_ids = [x.index_id_ for x in self.index_type2.indices_i5.all()]

        library = create_library(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type2,
        )
        library.index_i7 = INDICES_2[0].index
        library.index_i5 = INDICES_3[0].index
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
        self.assertEqual(data['data'][0]['index_i7_id'], 'B01')
        self.assertEqual(data['data'][0]['index_i5_id'], 'C01')
        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)
        self.assertIn(data['data'][1]['index_i5_id'], index_i5_ids)

    def test_libraries_and_samples_format_plate_mode_single(self):
        index_i7_ids = [x.index_id_ for x in self.index_type6.indices_i7.all()]

        library = create_library(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type6,
        )
        library.index_i7 = INDICES_9[0].index
        library.save()

        sample = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type6,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'libraries': json.dumps([library.pk]),
            'samples': json.dumps([sample.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
        self.assertEqual(data['data'][0]['index_i7_id'], 'I01')
        self.assertEqual(data['data'][0]['index_i5_id'], '')
        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)
        self.assertEqual(data['data'][1]['index_i5_id'], '')

    def test_libraries_and_samples_format_plate_mode_dual(self):
        index_i7_ids = [x.index_id_ for x in self.index_type5.indices_i7.all()]
        index_i5_ids = [x.index_id_ for x in self.index_type5.indices_i5.all()]

        library = create_library(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type5,
        )
        library.index_i7 = INDICES_7[0].index
        library.index_i5 = INDICES_8[0].index
        library.save()

        sample = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type5,
        )

        response = self.client.post('/api/index_generator/generate_indices/', {
            'libraries': json.dumps([library.pk]),
            'samples': json.dumps([sample.pk]),
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
        self.assertEqual(data['data'][0]['index_i7_id'], 'G01')
        self.assertEqual(data['data'][0]['index_i5_id'], 'H01')
        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)
        self.assertIn(data['data'][1]['index_i5_id'], index_i5_ids)

    def test_library_custom_index_i7_format_tube_mode_single(self):
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

        index_i7_ids = [x.index_id_ for x in self.index_type1.indices_i7.all()]
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
        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)

    def test_library_custom_index_i5_format_tube_mode_dual(self):
        index_i7_ids = [x.index_id_ for x in self.index_type2.indices_i7.all()]
        index_i5_ids = [x.index_id_ for x in self.index_type2.indices_i5.all()]

        library = create_library(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type2,
        )
        library.index_i7 = INDICES_2[0].index
        library.index_i5 = 'ACACAC'
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
        self.assertIn(data['data'][0]['index_i7_id'], index_i7_ids)
        self.assertEqual(data['data'][0]['index_i5_id'], '')
        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)
        self.assertIn(data['data'][1]['index_i5_id'], index_i5_ids)

    def test_library_custom_indices_i7_and_i5_format_tube_mode_dual(self):
        index_i7_ids = [x.index_id_ for x in self.index_type2.indices_i7.all()]
        index_i5_ids = [x.index_id_ for x in self.index_type2.indices_i5.all()]

        library = create_library(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type2,
        )
        library.index_i7 = 'TGTGTG'
        library.index_i5 = 'ACACAC'
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
        self.assertEqual(data['data'][0]['index_i7_id'], '')
        self.assertEqual(data['data'][0]['index_i5_id'], '')
        self.assertIn(data['data'][1]['index_i7_id'], index_i7_ids)
        self.assertIn(data['data'][1]['index_i5_id'], index_i5_ids)

    # Test failing data

    def test_not_enough_indices_format_tube_mode_single(self):
        """ Ensure error is thrown if the number of samples is greater than
        the number of unique indices. """
        pass

    def test_not_enough_indices_format_plate_mode_single(self):
        """ Ensure error is thrown if the number of samples is greater than
        the number of unique indices. """
        pass

    def test_save_pool_no_records(self):
        response = self.client.post('/api/index_generator/save_pool/')
        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(
            data['message'], 'No libraries nor samples have been provided.')

    def test_save_pool_invalid_or_missing_pool_size(self):
        sample = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type1,
        )

        response = self.client.post('/api/index_generator/save_pool/', {
            'samples': json.dumps([
                {
                    'pk': sample.pk,
                    'index_i7': INDICES_1[0].index,
                    'index_i5': '',
                }
            ]),
        })

        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'Invalid Pool Size id.')

    def test_save_pool_missing_index_i7(self):
        sample = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type1,
        )

        response = self.client.post('/api/index_generator/save_pool/', {
            'pool_size_id': self.pool_size.pk,
            'samples': json.dumps([
                {
                    'pk': sample.pk,
                    'index_i7': '',
                    'index_i5': '',
                }
            ]),
        })

        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(
            data['message'], f'Index I7 is not set for "{sample.name}".')

    def test_save_pool_missing_index_i5(self):
        sample = create_sample(
            get_random_name(),
            read_length=self.read_length,
            index_type=self.index_type2,
        )

        response = self.client.post('/api/index_generator/save_pool/', {
            'pool_size_id': self.pool_size.pk,
            'samples': json.dumps([
                {
                    'pk': sample.pk,
                    'index_i7': INDICES_2[0].index,
                    'index_i5': '',
                }
            ]),
        })

        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(
            data['message'], f'Index I5 is not set for "{sample.name}".')

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

    # Test static methods

    def test_index_convertion(self):
        converted_index = IndexGenerator.convert_index('ATCACG')
        self.assertEqual(converted_index, 'RGRRRG')

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
