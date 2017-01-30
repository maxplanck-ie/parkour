from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.test import TestCase

from .models import Request
from library.models import Library
from sample.models import Sample

import json
import tempfile

User = get_user_model()


# Models

class RequestTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        self.request = Request.objects.create(user=user)

    def test_request(self):
        self.assertEqual(self.request.__str__(), self.request.name)


# Views

class GetAllAdminTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(
            email='foo@bar.io', password='foo-foo', is_staff=True
        )
        user.save()

        request = Request(user=user)
        request.save()

    def test_get_all(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('request.get_all'))
        self.assertNotEqual(response.content, b'[]')
        self.assertEqual(response.status_code, 200)


class GetAllUserTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        user.save()

        request = Request(user=user)
        request.save()

    def test_get_all(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('request.get_all'))
        self.assertNotEqual(response.content, b'[]')
        self.assertEqual(response.status_code, 200)


class GetLibrariesSamplesTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        user.save()

        self.request = Request(user=user)
        self.request.save()

        library = Library.get_test_library('Library')
        sample = Sample.get_test_sample('Sample')
        library.save()
        sample.save()

        self.request.libraries.add(library)
        self.request.samples.add(sample)

    def test_get_libraries_samples(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('get_libraries_and_samples'), {
            'request_id': self.request.pk
        })
        # self.assertNotEqual(response.content, b'[]')
        self.assertEqual(response.status_code, 200)


class UpdateRequestTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        user.save()

        self.request = Request(user=user)
        self.request.save()

        self.library = Library.get_test_library('Library')
        self.sample = Sample.get_test_sample('Sample')
        self.library.save()
        self.sample.save()

    def test_save_request(self):
        """ Successfull 'save' test when everything is present. """
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_request'), {
            'mode': 'add',
            'description': 'description',
            'libraries': json.dumps([self.library.pk]),
            'samples': json.dumps([self.sample.pk])
        })
        self.assertEqual(response.status_code, 200)

    def test_update_request(self):
        """ Successfull 'update' test when everything is present. """
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_request'), {
            'mode': 'edit',
            'request_id': self.request.pk,
            'libraries': json.dumps([self.library.pk]),
            'samples': json.dumps([self.sample.pk]),
            'description': 'new_description'
        })
        self.assertEqual(response.status_code, 200)

    def test_missing_libraries_and_samples(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_request'), {
            'mode': 'add',
            'description': 'description'
        })
        self.assertEqual(response.status_code, 200)

    def test_exception(self):
        """ Empty or non-existing request_id. """
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_request'), {
            'mode': 'edit',
            'request_id': ''
        })
        self.assertEqual(response.status_code, 200)

    def test_invalid_form(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_request'), {'mode': 'add'})
        self.assertEqual(response.status_code, 200)


class DeleteRequestTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        user.save()

        self.request = Request(user=user)
        self.request.save()

    def test_delete_request(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_request'), {
            'request_id': self.request.pk
        })
        self.assertEqual(response.status_code, 200)

    def test_exception(self):
        """ Empty or non-existing request_id. """
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_request'), {
            'request_id': ''
        })
        self.assertEqual(response.status_code, 200)


class GenerateDeepSeqRequestTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        user.save()

        library = Library.get_test_library('Library')
        sample = Sample.get_test_sample('Sample')
        library.save()
        sample.save()

        self.request = Request(user=user)
        self.request.save()

        self.request.libraries.add(library)
        self.request.samples.add(sample)

    def test_generate(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(
            reverse('generate_deep_sequencing_request'), {
                'request_id': self.request.pk,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get('Content-Disposition'),
            'attachment; filename="%s_Deep_Sequencing_Request.pdf"' %
            self.request.name,
        )

    def test_missing_or_empty_request_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('generate_deep_sequencing_request'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            str(response.content, encoding='utf-8'),
            {'success': False},
        )


class UploadDeepSeqRequestTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        user.save()

        library = Library.get_test_library('Library')
        sample = Sample.get_test_sample('Sample')
        library.save()
        sample.save()

        self.request = Request(user=user)
        self.request.save()

        self.request.libraries.add(library)
        self.request.samples.add(sample)

    def test_upload(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        tmp_file = tempfile.NamedTemporaryFile()
        with open(tmp_file.name, 'rb') as fp:
            response = self.client.post(
                reverse('upload_deep_sequencing_request'),
                {'request_id': self.request.pk, 'file': fp},
                format='multipart'
            )
        tmp_file.close()
        self.assertEqual(response.status_code, 200)

    def test_missing_file(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('upload_deep_sequencing_request'), {
            'request_id': self.request.pk
        }, format='multipart')
        self.assertEqual(response.status_code, 200)

    def test_exception(self):
        """ Empty or non-existing request_id. """
        self.client.login(email='foo@bar.io', password='foo-foo')

        tmp_file = tempfile.NamedTemporaryFile()
        with open(tmp_file.name, 'rb') as fp:
            response = self.client.post(
                reverse('upload_deep_sequencing_request'),
                {'request_id': '', 'file': fp},
                format='multipart'
            )
        tmp_file.close()
        self.assertEqual(response.status_code, 200)


class GeneratePDFTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        user.save()

        self.request = Request(user=user)
        self.request.save()

    def test_generate_deep_sequencing_request(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(
            reverse('generate_deep_sequencing_request'), {
                'request_id': self.request.pk
            }
        )
        self.assertEqual(response.status_code, 200)
