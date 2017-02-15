from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.test import TestCase

from .models import Request
from library.models import Library
from sample.models import Sample
from common.models import Organization, PrincipalInvestigator

import json
import tempfile

User = get_user_model()


# Models

class RequestTest(TestCase):
    def setUp(self):
        self.org = Organization(name='Organization')
        self.org.save()

        self.pi = PrincipalInvestigator(name='PI', organization=self.org)
        self.pi.save()

        self.user = User.objects.create_user(
            first_name='Foo',
            last_name='Bar',
            email='foo@bar.io',
            password='foo-foo',
            organization=self.org,
            pi=self.pi,
        )

        self.request = Request.objects.create(user=self.user)
        self.request.save()

    def test_request(self):
        self.assertTrue(isinstance(self.request, Request))
        self.assertEqual(self.request.__str__(), self.request.name)
        self.assertEqual(self.request.name, '%i_%s_%s' % (
            self.request.pk, self.user.last_name, self.user.pi.name,
        ))


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
        self.assertEqual(response.status_code, 200)
        content = json.loads(str(response.content, 'utf-8'))
        self.assertEqual(content['success'], True)
        self.assertNotEqual(len(content['data']), 0)


class UpdateRequestTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            first_name='Foo',
            last_name='Bar',
            email='foo@bar.io',
            password='foo-foo',
        )
        self.user.save()

        self.request = Request(user=self.user)
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

        # Check Request name
        request = Library.objects.get(pk=self.library.pk).request.get()
        self.assertEqual(
            request.name,
            '%i_%s' % (request.pk, self.user.last_name),
        )

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
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True,
            'error': '',
        })

    def test_missing_libraries_and_samples(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_request'), {
            'mode': 'add',
            'description': 'description'
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Please provide Libraries and/or samples.',
        })

    def test_exception(self):
        """ Empty or non-existing request_id. """
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_request'), {
            'mode': 'edit',
            'request_id': ''
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': "invalid literal for int() with base 10: ''",
        })

    def test_invalid_form(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_request'), {'mode': 'add'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            json.loads(str(response.content, 'utf-8'))['success'],
            False,
        )


class DeleteRequestTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        user.save()

        self.library = Library.get_test_library('Library_delete')
        self.sample = Sample.get_test_sample('Sample_delete')
        self.library.save()
        self.sample.save()

        self.request = Request(user=user)
        self.request.save()

        self.request.libraries.add(self.library)
        self.request.samples.add(self.sample)

    def test_delete_request(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_request'), {
            'request_id': self.request.pk
        })
        self.assertEqual(response.status_code, 200)

        # Check if the request and its library have been deleted
        self.assertEqual(Request.objects.filter(pk=self.request.pk).count(), 0)
        self.assertEqual(Library.objects.filter(pk=self.library.pk).count(), 0)
        self.assertEqual(Sample.objects.filter(pk=self.sample.pk).count(), 0)

    def test_exception(self):
        """ Empty or non-existing request_id. """
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_request'), {
            'request_id': '-1'
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Request matching query does not exist.',
        })


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
