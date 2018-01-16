import json

from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from .models import Pool, PoolSize
from request.tests import create_request
from common.tests import BaseTestCase
from common.utils import get_random_name
from library_sample_shared.models import (
    ReadLength,
    IndexType,
    IndexI7,
    IndexI5,
)
from library.models import Library
from sample.models import Sample

from library.tests import create_library
from sample.tests import create_sample

from .index_generator import IndexGenerator

User = get_user_model()


INDICES_1_SINGLE = [
    ('A', '1', 'ATCACG'),
    ('A', '2', 'CGATGT'),
    ('A', '3', 'TTAGGC'),
    ('A', '4', 'TGACCA'),
    ('A', '5', 'ACAGTG'),
    ('A', '6', 'GCCAAT'),
    ('A', '7', 'CAGATC'),
    ('A', '8', 'ACTTGA'),
    ('A', '9', 'GATCAG'),
    ('A', '10', 'TAGCTT'),
    ('A', '11', 'GGCTAC'),
    ('A', '12', 'CTTGTA'),
    ('A', '13', 'AGTCAA'),
    ('A', '14', 'AGTTCC'),
    ('A', '15', 'ATGTCA'),
    ('A', '16', 'CCGTCC'),
    ('A', '17', 'GTCCGC'),
    ('A', '18', 'GTGAAA'),
    ('A', '19', 'GTGGCC'),
    ('A', '20', 'GTTTCG'),
    ('A', '21', 'CGTACG'),
    ('A', '22', 'GAGTGG'),
    ('A', '23', 'ACTGAT'),
    ('A', '24', 'ATTCCT'),
]


def create_pool(user, multiplier=1, size=200, save=True):
    pool_size = PoolSize(multiplier=multiplier, size=size)
    pool_size.save()

    pool = Pool(user=user, size=pool_size)

    if save:
        pool.save()

    return pool


# Models

class PoolTest(BaseTestCase):
    def setUp(self):
        self.user = self.create_user('test@test.io', 'foo-bar')
        self.pool = create_pool(self.user)

    def test_pool_name(self):
        self.assertTrue(isinstance(self.pool, Pool))
        self.assertEqual(self.pool.__str__(), self.pool.name)
        self.assertEqual(self.pool.name, 'Pool_%i' % self.pool.pk)

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
        self.pool.samples.add(sample)
        sample = sample.__class__.objects.get(pk=sample.pk)
        self.assertTrue(sample.is_pooled)
        self.assertTrue(sample.is_converted)
        self.assertIn('L', sample.barcode)


# Views

class TestPoolSize(BaseTestCase):
    def setUp(self):
        self.create_user('test@test.io', 'foo-bar')
        self.client.login(email='test@test.io', password='foo-bar')

    def test_pool_size_list(self):
        """ Ensure get pool sizes behaves correctly. """
        pool_size = PoolSize(multiplier=1, size=10)
        pool_size.save()

        response = self.client.get(reverse('pool-size-list'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        pool_sizes = [x['id'] for x in data]
        self.assertIn(pool_size.pk, pool_sizes)


class TestIndexGenerator(BaseTestCase):
    def setUp(self):
        self.user = self.create_user('test@test.io', 'foo-bar')
        self.client.login(email='test@test.io', password='foo-bar')

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

        response = self.client.get(reverse('index-generator-list'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        records = [x['name'] for x in data]
        self.assertIn(library1.name, records)
        self.assertIn(sample1.name, records)
        self.assertNotIn(library2.name, records)
        self.assertNotIn(library3.name, records)
        self.assertNotIn(sample2.name, records)

    def test_get_libraries_and_samples_list_non_staff(self):
        """Ensure error is thrown if a non-staff user tries to get the list."""
        self.create_user('non-staff@test.io', 'test', False)
        self.client.login(email='non-staff@test.io', password='test')
        response = self.client.get(reverse('index-generator-list'))
        self.assertTrue(response.status_code, 403)

    def test_update_record(self):
        """ Ensure update library/samples behaves correctly. """
        library = create_library(get_random_name(), 2)
        sample = create_sample(get_random_name(), 2)

        read_length = ReadLength(name=get_random_name())
        read_length.save()

        response = self.client.post(reverse('index-generator-edit'), {
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

        response = self.client.post(reverse('index-generator-edit'), {
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

        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['message'], 'Some records cannot be updated.')
        updated_library = Library.objects.get(pk=library.pk)
        updated_sample = Sample.objects.get(pk=sample.pk)
        self.assertEqual(updated_library.index_type, library.index_type)
        self.assertEqual(updated_sample.index_type, index_type)

    def test_index_generation_single_mode(self):
        """
        Ensure index generation in the single indices mode behaves correctly.
        """
        read_length = ReadLength(name=get_random_name())
        read_length.save()

        index_type = IndexType(
            name=get_random_name(),
            index_length='6',
        )
        index_type.save()

        # Populate the index type with indices
        for index in INDICES_1_SINGLE:
            index_i7 = IndexI7(
                prefix=index[0],
                number=index[1],
                index=index[2],
            )
            index_i7.save()
            index_type.indices_i7.add(index_i7)

        # library = create_library(get_random_name(), 2)
        sample1 = create_sample(
            name=get_random_name(),
            status=2,
            read_length=read_length,
            index_type=index_type,
        )

        sample2 = create_sample(
            name=get_random_name(),
            status=2,
            read_length=read_length,
            index_type=index_type,
        )

        response = self.client.post(
            reverse('index-generator-generate-indices'), {
                # 'libraries': json.dumps([]),
                'samples': json.dumps([sample1.pk, sample2.pk]),
            }
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])

    def test_no_samples(self):
        """ Ensure error is thrown if no samples have been provided. """
        response = self.client.post(
            reverse('index-generator-generate-indices'), {}
        )

        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'No samples have been provided.')

    def test_read_lengths_not_equal(self):
        """ Ensure error is thrown if provided read lengths aren't equal. """
        read_length1 = ReadLength(name=get_random_name())
        read_length1.save()

        read_length2 = ReadLength(name=get_random_name())
        read_length2.save()

        sample1 = create_sample(
            name=get_random_name(),
            status=2,
            read_length=read_length1,
        )

        sample2 = create_sample(
            name=get_random_name(),
            status=2,
            read_length=read_length2,
        )

        response = self.client.post(
            reverse('index-generator-generate-indices'), {
                'samples': json.dumps([sample1.pk, sample2.pk]),
            }
        )

        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'Read lengths must be the same.')

    def test_index_type_not_set(self):
        """ Ensure error is thrown of index type is not set. """
        read_length = ReadLength(name=get_random_name())
        read_length.save()

        index_type = IndexType(name=get_random_name(), index_length='6')
        index_type.save()

        # library = create_library(get_random_name(), 2)
        sample1 = create_sample(
            name=get_random_name(),
            status=2,
            read_length=read_length,
        )

        sample2 = create_sample(
            name=get_random_name(),
            status=2,
            read_length=read_length,
            index_type=index_type,
        )

        response = self.client.post(
            reverse('index-generator-generate-indices'), {
                'samples': json.dumps([sample1.pk, sample2.pk]),
            }
        )

        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(
            data['message'],
            'Index Type must be set for all libraries and samples.'
        )

    def test_index_conversion(self):
        """ Ensure the convertion A/C into R and T into G behaves correctly."""
        converted_index = IndexGenerator._convert_index('ATCACG')
        self.assertEqual(converted_index, 'RGRRRG')


# class SavePoolTest(TestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(
#             email='foo@bar.io',
#             password='foo-foo',
#             is_staff=True,
#         )
#         self.user.save()
#
#         self.index_i7 = IndexI7.objects.get(pk=1)
#
#         self.library = Library.get_test_library()
#         self.sample1 = Sample.get_test_sample()
#         self.sample2 = Sample.get_test_sample()
#         self.sample1.index = self.index_i7.index
#         self.library.save()
#         self.sample1.save()
#         self.sample2.save()
#
#     def test_save_pool(self):
#         self.client.login(email='foo@bar.io', password='foo-foo')
#         samples = [{
#             'sample_id': self.sample1.pk,
#             'index_i7_id': self.index_i7.index_id,
#             'index_i5_id': '',
#         }]
#         response = self.client.post(reverse('save_pool'), {
#             'libraries': '[%s]' % self.library.pk,
#             'samples': json.dumps(samples),
#         })
#         self.assertEqual(response.status_code, 200)
#         self.assertJSONEqual(str(response.content, 'utf-8'), {
#             'success': True,
#             'error': '',
#         })
#
#         pooling_objects = Pooling.objects.filter(library=self.library)
#         self.assertEqual(pooling_objects.count(), 1)
#
#         libprep_objects = LibraryPreparation.objects.filter(sample=self.sample1)
#         self.assertEqual(libprep_objects.count(), 1)
#
#     def test_missing_index_i7(self):
#         self.client.login(email='foo@bar.io', password='foo-foo')
#         samples = [{
#             'sample_id': self.sample2.pk,
#             'index_i7_id': '',
#             'index_i5_id': '',
#         }]
#         response = self.client.post(reverse('save_pool'), {
#             'libraries': '[%s]' % self.library.pk,
#             'samples': json.dumps(samples),
#         })
#         self.assertEqual(response.status_code, 200)
#         self.assertJSONEqual(str(response.content, 'utf-8'), {
#             'success': False,
#             'error': 'Could not save Pool.',
#         })
#
#     def test_missing_libraries_and_samples(self):
#         self.client.login(email='foo@bar.io', password='foo-foo')
#         response = self.client.post(reverse('save_pool'))
#         self.assertEqual(response.status_code, 200)
#         self.assertJSONEqual(str(response.content, 'utf-8'), {
#             'success': False,
#             'error': 'Neither libraries nor samples have been provided.',
#         })
#
#     def test_wrong_http_method(self):
#         self.client.login(email='foo@bar.io', password='foo-foo')
#         response = self.client.get(reverse('save_pool'))
#         self.assertEqual(response.status_code, 200)
#         self.assertJSONEqual(str(response.content, 'utf-8'), {
#             'success': False,
#             'error': 'Wrong HTTP method.',
#         })
