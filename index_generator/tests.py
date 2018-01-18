import json

from common.tests import BaseTestCase
from common.utils import get_random_name

from request.tests import create_request
from library_sample_shared.tests import create_index_type
from library.tests import create_library
from sample.tests import create_sample

from library_sample_shared.models import (
    ReadLength,
    IndexType,
    IndexI7,
    IndexI5,
)
from library.models import Library
from sample.models import Sample

from .models import Pool, PoolSize
from .index_generator import IndexGenerator


# Best match: A02 and A03
INDICES_I7 = [
    ('A', '01', 'AAAAAA'),
    ('A', '02', 'ATCACG'),
    ('A', '03', 'TAGTGC'),
]


def create_pool(user, multiplier=1, size=200, save=True):
    pool_size = PoolSize(multiplier=multiplier, size=size)
    pool_size.save()

    pool = Pool(user=user, size=pool_size)

    if save:
        pool.save()

    return pool


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


class TestIndexGenerator(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.login()

        self.index_type1 = IndexType(name=get_random_name(), index_length='6')
        self.index_type1.save()

        for idx in INDICES_I7:
            index = IndexI7(prefix=idx[0], number=idx[1], index=idx[2])
            index.save()
            self.index_type1.indices_i7.add(index)

    # def test_generate_index_for_one_sample(self):
    #     """ Generate index for one sample (format=tube, mode=single). """
    #     sample = create_sample(
    #         get_random_name(), 2, index_type=self.index_type1)
    #     response = self.client.post('/api/index_generator/generate_indices/', {
    #         'samples': json.dumps([sample.pk]),
    #     })
    #     self.assertEqual(response.status_code, 200)
    #     data = response.json()
    #     self.assertTrue(data['success'])

    #     sample = Sample.objects.get(pk=sample.pk)
    #     indices = self.index_type1.indices_i7.values_list('index', flat=True)
    #     self.assertIn(sample.index_i7, indices)

    # def test_generate_tube_single_samples_only(self):
    #     """ Generate indices for samples only (format=tube, mode=single). """
    #     sample1 = create_sample(get_random_name(), 2)
    #     sample2 = create_sample(get_random_name(), 2)
    #     sample3 = create_sample(get_random_name(), 2)

    #     response = self.client.post('/api/index_generator/generate_indices/', {
    #         'samples': json.dumps([sample1.pk, sample2.pk, sample3.pk]),
    #     })
    #     self.assertEqual(response.status_code, 200)

    def test_no_samples(self):
        """ Ensure error is thrown if no samples have been provided. """
        response = self.client.post('/api/index_generator/generate_indices/')
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'No samples provided.')

    def test_index_type_not_set(self):
        """ Ensure error is thrown if Index Type is not set. """
        index_type = create_index_type(get_random_name())
        sample1 = create_sample(get_random_name(), index_type=index_type)
        sample2 = create_sample(get_random_name())

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
        index_type1 = create_index_type(get_random_name())
        index_type2 = create_index_type(get_random_name(), is_dual=True)
        sample1 = create_sample(get_random_name(), index_type=index_type1)
        sample2 = create_sample(get_random_name(), index_type=index_type2)

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
        index_type1 = create_index_type(get_random_name())
        index_type2 = create_index_type(get_random_name(), index_length='6')
        sample1 = create_sample(get_random_name(), index_type=index_type1)
        sample2 = create_sample(get_random_name(), index_type=index_type2)

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
        index_type1 = create_index_type(get_random_name())
        index_type2 = create_index_type(get_random_name(), format='plate')
        sample1 = create_sample(get_random_name(), index_type=index_type1)
        sample2 = create_sample(get_random_name(), index_type=index_type2)

        response = self.client.post('/api/index_generator/generate_indices/', {
            'samples': json.dumps([sample1.pk, sample2.pk]),
        })
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'Index Types with mixed formats ' +
                         'are not allowed.')

    def test_index_convertion(self):
        converted_index = IndexGenerator.convert_index('ATCACG')
        self.assertEqual(converted_index, 'RGRRRG')
