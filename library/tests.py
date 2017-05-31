import json

from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.test import TestCase

from library_sample_shared.models import (Organism, IndexType,
                                          ConcentrationMethod, ReadLength,
                                          LibraryProtocol, LibraryType)
from .models import Library
from sample.models import Sample
from request.models import Request

User = get_user_model()


# Views

class GetAllLibrariesTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(
            email='foo@bar.io', password='foo-foo', is_staff=True,
        )
        user.save()

        library = Library.get_test_library('Library')
        sample = Sample.get_test_sample('Sample')
        library.save()
        sample.save()

        self.request = Request(user=user)
        self.request.save()
        self.request.libraries.add(library)
        self.request.samples.add(sample)

    def test_get_all(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('library.get_all'))
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.content, b'[]')


class SaveLibraryTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

        self.library_protocol = LibraryProtocol(
            name='Protocol',
            provider='Provider',
        )
        self.library_protocol.save()

        self.library_type = LibraryType(name='Library Type')
        self.library_type.save()
        self.library_type.library_protocol.add(self.library_protocol)

        self.organism = Organism(name='Human')
        self.organism.save()

        self.index_type = IndexType(name='Nextera')
        self.index_type.save()

        self.method = ConcentrationMethod(name='fluorography')
        self.method.save()

        self.read_length = ReadLength(name='1x50')
        self.read_length.save()

        self.test_library = Library(
            name='Library_edit',
            organism_id=self.organism.pk,
            concentration=1.0,
            concentration_method_id=self.method.pk,
            read_length_id=self.read_length.pk,
            sequencing_depth=1,
            library_protocol_id=self.library_protocol.pk,
            library_type_id=self.library_type.pk,
            amplification_cycles=1,
            index_type_id=self.index_type.pk,
            index_reads=0,
            mean_fragment_size=1,
        )
        self.test_library.save()

    def test_save_ok(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {
            'mode': 'add',
            'records': json.dumps([{
                'name': 'Library_add',
                'library_protocol': self.library_protocol.pk,
                'library_type': self.library_type.pk,
                'amplification_cycles': 1,
                'organism': self.organism.pk,
                'index_type': self.index_type.pk,
                'index_reads': 0,
                'index_i7': '',
                'index_i5': '',
                'equal_representation_nucleotides': 'false',
                'concentration': 1.0,
                'concentration_method': self.method.pk,
                'mean_fragment_size': 1,
                'qpcr_result': 1,
                'read_length': self.read_length.pk,
                'sequencing_depth': 1,
                'comments': '',
            }]),
        })
        self.assertEqual(response.status_code, 200)
        library = Library.objects.get(name='Library_add')
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True,
            'error': [],
            'data': [{
                'name': library.name,
                'recordType': 'L',
                'libraryId': library.pk,
                'barcode': library.barcode,
            }],
        })

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('save_library'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not save the library(-ies).',
            'data': [],
        })

    def test_missing_records(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {'mode': 'add'})
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not save the library(-ies).',
            'data': [],
        })

    def test_wrong_or_missing_mode(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {
            'records': '[{}]'
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not save the library(-ies).',
            'data': [],
        })

    def test_missing_or_invalid_fields(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {
            'mode': 'add',  # works for 'edit' too
            'records': json.dumps([{
                'name': 'Library',
            }])
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': [{
                'name': 'Library',
                'value': 'Could not save the library.'
            }],
            'data': [],
        })

    def test_edit_ok(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {
            'mode': 'edit',
            'records': json.dumps([{
                'library_id': self.test_library.pk,
                'name': 'Library_edit_new',
                'library_protocol': self.library_protocol.pk,
                'library_type': self.library_type.pk,
                'amplification_cycles': 1,
                'organism': self.organism.pk,
                'index_type': self.index_type.pk,
                'index_reads': 0,
                'index_i7': '',
                'index_i5': '',
                'equal_representation_nucleotides': 'false',
                'concentration': 1.0,
                'concentration_method': self.method.pk,
                'mean_fragment_size': 1,
                'qpcr_result': 1,
                'read_length': self.read_length.pk,
                'sequencing_depth': 1,
                'comments': '',
            }]),
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True,
            'error': [],
            'data': [],
        })

    def test_missing_or_empty_library_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {
            'mode': 'edit',
            'records': json.dumps([{
                'name': 'Library'
            }])
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not save the library(-ies).',
            'data': [],
        })


class DeleteLibraryTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')
        self.library = Library.get_test_library('Library')
        self.library.save()

    def test_delete_library(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_library'), {
            'record_id': self.library.pk
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True, 'error': '',
        })

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('delete_library'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Could not delete the library.',
        })

    def test_missing_or_empty_record_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_library'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False, 'error': 'Could not delete the library.',
        })

    def test_non_existing_record_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_library'), {
            'record_id': '-1'
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False, 'error': 'Could not delete the library.',
        })
