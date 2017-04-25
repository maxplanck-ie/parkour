import json

from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from request.models import Request
from library.models import Library
from sample.models import Sample

User = get_user_model()


# Views

class GetAllLibraries(TestCase):
    def setUp(self):
        user = User.objects.create_user(
            email='foo@bar.io', password='foo-foo', is_staff=True,
        )
        user.save()

        self.request = Request(user=user)
        self.request.save()

    def test_get_all(self):
        self.client.login(email='foo@bar.io', password='foo-foo')

        library = Library.get_test_library('Library1')
        library.status = 1
        library.save()

        sample = Sample.get_test_sample('Sample1')
        sample.status = 1
        sample.save()

        self.request.libraries.add(library)
        self.request.samples.add(sample)

        response = self.client.get(reverse('library.get_all'), {
            'quality_check': 'true'
        })
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.content, b'[]')

    def test_get_all_empty(self):
        self.client.login(email='foo@bar.io', password='foo-foo')

        library = Library.get_test_library('Library2')
        library.save()

        sample = Sample.get_test_sample('Sample2')
        sample.save()

        self.request.libraries.add(library)
        self.request.samples.add(sample)

        response = self.client.get(reverse('library.get_all'), {
            'quality_check': 'true'
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'[]')


class UpdateTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

        self.library = Library.get_test_library('Library_update')
        self.library.status = 1
        self.library.save()

        self.sample1 = Sample.get_test_sample('Sample1_update')
        self.sample1.status = 1
        self.sample1.save()

        self.sample2 = Sample.get_test_sample('Sample2_update')
        self.sample2.status = 1
        self.sample2.save()

    def test_update_library_ok(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('quality_check.update'), {
            'record_id': self.library.pk,
            'record_type': 'L',
            'concentration_facility': '1.5',
            'qc_result': '1',
        })

        self.assertEqual(response.status_code, 200)
        updated_library = Library.objects.get(pk=self.library.pk)
        self.assertEqual(updated_library.concentration_facility, 1.5)
        self.assertEqual(updated_library.status, 2)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True, 'error': '',
        })

    def test_update_sample_ok(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('quality_check.update'), {
            'record_id': self.sample1.pk,
            'record_type': 'S',
            'concentration_facility': '2.0',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            Sample.objects.get(pk=self.sample1.pk).concentration_facility,
            2.0,
        )
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True, 'error': '',
        })

    def test_update_record_fail(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('quality_check.update'), {
            'record_id': self.sample2.pk,
            'record_type': 'S',
            'concentration_facility': 'string',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            json.loads(str(response.content, 'utf-8'))['success'],
            False,
        )

    def test_update_qc_fail(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('quality_check.update'), {
            'record_id': self.sample2.pk,
            'record_type': 'S',
            'qc_result': '-1',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Sample.objects.get(pk=self.sample2.pk).status, -1,)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True, 'error': '',
        })

    def test_record_type_missing(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('quality_check.update'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Cannot update the record.',
        })

    def test_non_existing_record_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('quality_check.update'), {
            'record_type': 'L',
            'record_id': '-1',
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Cannot update the record.',
        })

    def test_missing_or_empty_record_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('quality_check.update'), {
            'record_type': 'L',
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Cannot update the record.',
        })

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('quality_check.update'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Wrong HTTP method.',
        })
