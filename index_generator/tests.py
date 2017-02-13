import json

from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from .models import Pool
from request.models import Request
from library_sample_shared.models import (ReadLength, IndexType,
                                          IndexI7, IndexI5)
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

class PoolingTreeTest(TestCase):
    def setUp(self):
        user1 = User.objects.create_user(
            email='foo1@bar.io',
            password='foo-foo',
            is_staff=True,
        )
        user1.save()

        user2 = User.objects.create_user(
            email='foo2@bar.io',
            password='foo-foo',
            is_staff=False,
        )
        user2.save()

        library1 = Library.get_test_library()
        library2 = Library.get_test_library()
        library3 = Library.get_test_library()
        sample1 = Sample.get_test_sample()
        sample2 = Sample.get_test_sample()
        sample3 = Sample.get_test_sample()
        library1.index_i7 = 'ATCACG'
        library2.index_i7 = 'CGATGT'
        library1.status = 2
        library2.status = 2
        library3.status = 2
        sample1.status = 2
        sample2.status = 2
        sample3.status = 2

        library3.is_pooled = True
        sample3.is_pooled = True

        library1.save()
        library2.save()
        library3.save()
        sample1.save()
        sample2.save()
        sample3.save()

        self.request1 = Request.objects.create(user=user1)
        self.request2 = Request.objects.create(user=user2)
        self.request3 = Request.objects.create(user=user1)
        self.request1.save()
        self.request2.save()
        self.request3.save()

        self.request1.libraries.add(library1)
        self.request2.libraries.add(library2)
        self.request3.libraries.add(library3)
        self.request1.samples.add(sample1)
        self.request2.samples.add(sample2)
        self.request3.samples.add(sample3)

    def test_get_tree_admin(self):
        self.client.login(email='foo1@bar.io', password='foo-foo')
        response = self.client.get(reverse('pooling_tree'))
        self.assertEqual(response.status_code, 200)
        result = json.loads(str(response.content, 'utf-8'))['children']
        self.assertEqual(len(result), 2)
        self.assertEqual(
            [req['text'] for req in result],
            [self.request1.name, self.request2.name],
        )

    def test_get_tree_user(self):
        self.client.login(email='foo2@bar.io', password='foo-foo')
        response = self.client.get(reverse('pooling_tree'))
        self.assertEqual(response.status_code, 200)
        result = json.loads(str(response.content, 'utf-8'))['children']
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['text'], self.request2.name)

    def test_empty_result(self):
        self.client.login(email='foo1@bar.io', password='foo-foo')
        Request.objects.get(pk=self.request1.pk).delete()
        Request.objects.get(pk=self.request2.pk).delete()
        response = self.client.get(reverse('pooling_tree'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'text': '.',
            'children': [],
        })


class ReadLengthTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

        self.read_length = ReadLength(name='Read Length')
        self.read_length.save()

        self.library = Library.get_test_library()
        self.sample = Sample.get_test_sample()
        self.library.read_length = self.read_length
        self.sample.read_length = self.read_length
        self.library.save()
        self.sample.save()

    def test_update_read_length_library(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_read_length'), {
            'record_type': 'L',
            'record_id': self.library.pk,
            'read_length_id': self.read_length.pk,
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True,
            'error': '',
        })

    def test_update_read_length_sample(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_read_length'), {
            'record_type': 'S',
            'record_id': self.sample.pk,
            'read_length_id': self.read_length.pk,
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True,
            'error': '',
        })

    def test_missing_record_type(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_read_length'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not update Read Length.',
        })

    def test_non_existing_record_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_read_length'), {
            'record_type': 'L',
            'record_id': '-1',
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not update Read Length.',
        })

    def test_missing_or_empty_record_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_read_length'), {
            'record_type': 'L',
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not update Read Length.',
        })

    def test_non_existing_read_length(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_read_length'), {
            'record_type': 'L',
            'record_id': self.library.pk,
            'read_length_id': '-1',
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not update Read Length.',
        })

    def test_missing_or_empty_read_length_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_read_length'), {
            'record_type': 'L',
            'record_id': self.library.pk,
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not update Read Length.',
        })

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('update_read_length'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Wrong HTTP method.',
        })


class IndexTypeTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

        self.index_type = IndexType(name='Index Type')
        self.index_type.save()

        self.sample = Sample.get_test_sample()
        self.sample.index_type = self.index_type
        self.sample.save()

    def test_update_index_type(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_index_type'), {
            'sample_id': self.sample.pk,
            'index_type_id': self.index_type.pk,
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True,
            'error': '',
        })

    def test_non_existing_sample_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_index_type'), {
            'sample_id': '-1',
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not update Index Type.',
        })

    def test_missing_or_empty_sample_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_index_type'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not update Index Type.',
        })

    def test_non_existing_index_type(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_index_type'), {
            'sample_id': self.sample.pk,
            'index_type_id': '-1',
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not update Index Type.',
        })

    def test_missing_or_empty_index_type_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('update_index_type'), {
            'sample_id': self.sample.pk,
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not update Index Type.',
        })

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('update_index_type'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Wrong HTTP method.',
        })


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
        idx1 = IndexI7(index_type=idx_type1, index='ATCACG', index_id='A01')
        idx2 = IndexI7(index_type=idx_type1, index='CGATGT', index_id='A02')
        idx3 = IndexI7(index_type=idx_type1, index='ACAGTG', index_id='A05')
        idx4 = IndexI7(index_type=idx_type1, index='GTGGCC', index_id='A20')
        idx5 = IndexI7(index_type=idx_type1, index='GAGTGG', index_id='A23')
        idx6 = IndexI7(index_type=idx_type1, index='ATTCCT', index_id='A27')
        idx7 = IndexI7(index_type=idx_type1, index='ATGTCA', index_id='A15')
        idx8 = IndexI7(index_type=idx_type1, index='AGTCAA', index_id='A13')
        idx9 = IndexI7(index_type=idx_type1, index='GTCCGC', index_id='A18')
        idx10 = IndexI7(index_type=idx_type1, index='GTGAAA', index_id='A19')
        idx11 = IndexI7(index_type=idx_type2, index='ATCACG', index_id='RP1')
        idx12 = IndexI7(index_type=idx_type2, index='CAACTA', index_id='RP29')
        idx13 = IndexI7(index_type=idx_type2, index='TACAGC', index_id='RP43')
        idx14 = IndexI7(index_type=idx_type2, index='GGTAGC', index_id='RP24')
        idx15 = IndexI7(index_type=idx_type2, index='GTGAAA', index_id='RP19')
        idx16 = IndexI7(index_type=idx_type3, index='TAAGGCGA', index_id='N01')
        idx17 = IndexI7(index_type=idx_type3, index='CGTACTAG', index_id='N02')
        idx18 = IndexI7(index_type=idx_type3, index='AGGCAGAA', index_id='N03')
        idx19 = IndexI7(index_type=idx_type3, index='TCCTGAGC', index_id='N04')
        idx20 = IndexI7(index_type=idx_type3, index='GGACTCCT', index_id='N05')

        # Indices I5
        idx21 = IndexI5(index_type=idx_type3, index='TAGATCGC', index_id='S01')
        idx22 = IndexI5(index_type=idx_type3, index='CTCTCTAT', index_id='S02')
        idx23 = IndexI5(index_type=idx_type3, index='TATCCTCT', index_id='S03')
        idx24 = IndexI5(index_type=idx_type3, index='AGAGTAGA', index_id='S04')
        idx25 = IndexI5(index_type=idx_type3, index='GTAAGGAG', index_id='S05')

        idx1.save()
        idx2.save()
        idx3.save()
        idx4.save()
        idx5.save()
        idx6.save()
        idx7.save()
        idx8.save()
        idx9.save()
        idx10.save()
        idx11.save()
        idx12.save()
        idx13.save()
        idx14.save()
        idx15.save()
        idx16.save()
        idx17.save()
        idx18.save()
        idx19.save()
        idx20.save()
        idx21.save()
        idx22.save()
        idx23.save()
        idx24.save()
        idx25.save()

        # Libraries
        self.library1 = Library.get_test_library()
        self.library2 = Library.get_test_library()
        self.library3 = Library.get_test_library()
        self.library1.index_type = idx_type1
        self.library3.index_type = idx_type3
        self.library1.index_i7 = 'ATCACG'
        self.library2.index_i7 = 'ATCGAT'
        self.library3.index_i7 = 'TAAGGCGA'
        self.library3.index_i5 = 'TAGATCGC'
        self.library1.save()
        self.library2.save()
        self.library3.save()

        # Samples
        self.sample1 = Sample.get_test_sample()
        self.sample2 = Sample.get_test_sample()
        self.sample3 = Sample.get_test_sample()
        self.sample4 = Sample.get_test_sample()
        self.sample5 = Sample.get_test_sample()
        self.sample6 = Sample.get_test_sample()
        self.sample1.index_type = idx_type1
        self.sample2.index_type = idx_type1
        self.sample3.index_type = idx_type2
        self.sample4.index_type = idx_type3  # Index I5
        self.sample1.save()
        self.sample2.save()
        self.sample3.save()
        self.sample4.save()
        self.sample5.save()
        self.sample6.save()

        # Not compatible libraries and samples
        self.library4 = Library.get_test_library()
        self.library5 = Library.get_test_library()
        self.library4.sequencing_depth = 3
        self.library5.sequencing_depth = 3
        self.library4.index_i7 = 'ATCGAT'
        self.library5.index_i7 = 'TTCGAT'
        self.library4.save()
        self.library5.save()

    def test_generate_indices(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        libraries = ','.join([str(self.library1.pk), str(self.library2.pk),
                              str(self.library3.pk)])
        samples = ','.join([str(self.sample1.pk), str(self.sample2.pk),
                            str(self.sample3.pk), str(self.sample4.pk)])
        response = self.client.post(reverse('generate_indices'), {
            'libraries': '[%s]' % libraries,
            'samples': '[%s]' % samples,
        })
        self.assertEqual(response.status_code, 200)
        content = json.loads(str(response.content, 'utf-8'))
        self.assertEqual(content['success'], True)
        # self.assertGreater(len(content['data']), 0)
        self.assertEqual(
            [i['indexI7Id'] for i in content['data']],
            ['A01', '', 'N01', 'A23', 'A13', 'RP43', 'N02'],
        )
        self.assertEqual(
            [i['indexI5Id'] for i in content['data']],
            ['', '', 'S01', '', '', '', 'S02'],
        )

    def test_generate_indices_samples_only(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        samples = ','.join([str(self.sample1.pk), str(self.sample2.pk),
                            str(self.sample3.pk), str(self.sample4.pk)])
        response = self.client.post(reverse('generate_indices'), {
            'samples': '[%s]' % samples,
        })
        self.assertEqual(response.status_code, 200)
        content = json.loads(str(response.content, 'utf-8'))
        self.assertEqual(content['success'], True)
        # self.assertGreater(len(content['data']), 0)
        self.assertEqual(
            [i['indexI7Id'] for i in content['data']],
            ['A05', 'A19', 'RP1', 'N01'],
        )

    def test_not_compatible(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        libraries = ','.join([str(self.library4.pk), str(self.library5.pk)])
        samples = ','.join([str(self.sample1.pk), str(self.sample2.pk)])
        response = self.client.post(reverse('generate_indices'), {
            'libraries': '[%s]' % libraries,
            'samples': '[%s]' % samples,
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not generate indices.',
            'data': [],
        })

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
        samples = ','.join([str(self.sample5.pk), str(self.sample6.pk)])
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


class SavePoolTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

    def test_save_pool(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_pool'), {

        })
        self.assertEqual(response.status_code, 200)

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('save_pool'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Wrong HTTP method.',
        })
