import json

from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from .models import Pool
from library_sample_shared.models import IndexType, IndexI7, IndexI5
from library.models import Library
from sample.models import Sample

User = get_user_model()


# Models

class PoolTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            first_name='Foo',
            last_name='Bar',
            email='foo@bar.io',
            password='foo-foo',
        )
        self.pool = Pool(user=self.user)
        self.pool.save()

    def test_pool_name(self):
        self.assertTrue(isinstance(self.pool, Pool))
        self.assertEqual(self.pool.__str__(), self.pool.name)


# Views

class GenerateIndicesTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

        # Index Types
        idx_type1 = IndexType(name='Index Type 1', is_index_i7=True)
        idx_type2 = IndexType(name='Index Type 2', is_index_i7=True)
        idx_type3 = IndexType(
            name='Index Type 3',
            is_index_i7=True,
            is_index_i5=True,
        )
        idx_type1.save()
        idx_type2.save()
        idx_type3.save()

        # Indices I7
        index1 = IndexI7(index_type=idx_type1, index='ATCACG', index_id='A01')
        index2 = IndexI7(index_type=idx_type1, index='CGATGT', index_id='A02')
        index3 = IndexI7(index_type=idx_type1, index='ACAGTG', index_id='A05')
        index4 = IndexI7(index_type=idx_type1, index='GTGGCC', index_id='A20')
        index5 = IndexI7(index_type=idx_type1, index='GAGTGG', index_id='A23')
        index6 = IndexI7(index_type=idx_type1, index='ATTCCT', index_id='A27')
        index7 = IndexI7(index_type=idx_type1, index='ATGTCA', index_id='A15')
        index8 = IndexI7(index_type=idx_type1, index='AGTCAA', index_id='A13')
        index9 = IndexI7(index_type=idx_type1, index='GTCCGC', index_id='A18')
        index10 = IndexI7(index_type=idx_type1, index='GTGAAA', index_id='A19')
        index11 = IndexI7(index_type=idx_type2, index='ATCACG', index_id='RP1')
        index12 = IndexI7(index_type=idx_type2, index='CAACTA', index_id='RP29')
        index13 = IndexI7(index_type=idx_type2, index='TACAGC', index_id='RP43')
        index14 = IndexI7(index_type=idx_type2, index='GGTAGC', index_id='RP24')
        index15 = IndexI7(index_type=idx_type2, index='GTGAAA', index_id='RP19')

        index1.save()
        index2.save()
        index3.save()
        index4.save()
        index5.save()
        index6.save()
        index7.save()
        index8.save()
        index9.save()
        index10.save()
        index11.save()
        index12.save()
        index13.save()
        index14.save()
        index15.save()

        # Libraries
        self.library1 = Library.get_test_library('Library1')
        self.library2 = Library.get_test_library('Library2')
        self.library1.index_type = idx_type1
        self.library1.index_i7 = 'ATCACG'
        self.library2.index_i7 = 'ATCGAT'
        self.library1.save()
        self.library2.save()

        # Samples
        self.sample1 = Sample.get_test_sample('Sample1')
        self.sample2 = Sample.get_test_sample('Sample2')
        self.sample3 = Sample.get_test_sample('Sample3')
        self.sample4 = Sample.get_test_sample('Sample4')
        self.sample5 = Sample.get_test_sample('Sample5')
        self.sample1.index_type = idx_type1
        self.sample2.index_type = idx_type1
        self.sample3.index_type = idx_type2
        self.sample1.save()
        self.sample2.save()
        self.sample3.save()
        self.sample4.save()
        self.sample5.save()

    def test_generate_indices(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        libraries = ','.join(
            [str(self.library1.pk), str(self.library2.pk)],
        )
        samples = ','.join(
            [str(self.sample1.pk), str(self.sample2.pk), str(self.sample3.pk)],
        )
        response = self.client.post(reverse('generate_indices'), {
            'libraries': '[%s]' % libraries,
            'samples': '[%s]' % samples,
        })
        self.assertEqual(response.status_code, 200)
        content = json.loads(str(response.content, 'utf-8'))
        self.assertEqual(content['success'], True)
        self.assertGreater(len(content['data']), 0)

    def test_generate_indices_samples_only(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        samples = ','.join(
            [str(self.sample1.pk), str(self.sample2.pk), str(self.sample3.pk)],
        )
        response = self.client.post(reverse('generate_indices'), {
            'samples': '[%s]' % samples,
        })
        self.assertEqual(response.status_code, 200)
        content = json.loads(str(response.content, 'utf-8'))
        self.assertEqual(content['success'], True)
        # self.assertGreater(len(content['data']), 0)
        self.assertEqual(
            [i['indexI7Id'] for i in content['data']],
            ['A05', 'A19', 'RP1'],
        )

    def test_one_sample(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('generate_indices'), {
            'samples': '[%s]' % self.sample1.pk,
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Select at least two samples.',
            'data': [],
        })

    def test_missing_index_types(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        samples = ','.join(
            [str(self.sample4.pk), str(self.sample5.pk)],
        )
        response = self.client.post(reverse('generate_indices'), {
            'samples': '[%s]' % samples,
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Index Type must be set for all libraries and samples.',
            'data': [],
        })

    def test_missing_samples(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('generate_indices'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'No samples.',
            'data': [],
        })
