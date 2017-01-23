from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.core.files.base import ContentFile
from django.test import TestCase

from library_sample_shared.models import (Organism, IndexType,
                                          ConcentrationMethod, ReadLength)
from .models import LibraryProtocol, LibraryType, FileLibrary, Library
from sample.models import Sample
from request.models import Request

import tempfile

User = get_user_model()


# Models

class LibraryProtocolTest(TestCase):
    def setUp(self):
        self.protocol = LibraryProtocol(
            name='Protocol',
            provider='Provider',
        )

    def test_library_protocol_name(self):
        self.assertTrue(isinstance(self.protocol, LibraryProtocol))
        self.assertEqual(self.protocol.__str__(), self.protocol.name)


class LibraryTypeTest(TestCase):
    def setUp(self):
        self.library_type = LibraryType(name='Library Type')

    def test_library_type_name(self):
        self.assertTrue(isinstance(self.library_type, LibraryType))
        self.assertEqual(self.library_type.__str__(), self.library_type.name)


class FileLibraryTest(TestCase):
    def setUp(self):
        tmp_file = tempfile.NamedTemporaryFile()
        self.file = FileLibrary(name='File', file=tmp_file)
        tmp_file.close()

    def test_file_name(self):
        self.assertTrue(isinstance(self.file, FileLibrary))
        self.assertEqual(self.file.__str__(), self.file.name)


# Views

class GetAllLibrariesAdminTest(TestCase):
    _is_staff = True

    def setUp(self):
        user = User.objects.create_user(
            email='foo@bar.io', password='foo-foo', is_staff=self._is_staff,
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

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('library.get_all'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'[]')


class GetAllLibrariesUserTest(GetAllLibrariesAdminTest):
    _is_staff = False


class GetLibraryProtocols(TestCase):
    def test_get_library_protocols(self):
        response = self.client.get(reverse('get_library_protocols'))
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.content, b'[]')


class GetLibraryType(TestCase):
    def setUp(self):
        self.library_protocol = LibraryProtocol(
            name='Protocol',
            provider='Provider',
        )
        self.library_protocol.save()

        self.library_type = LibraryType(name='Library Type')
        self.library_type.save()
        self.library_type.library_protocol.add(self.library_protocol)

    def test_get_library_type_ok(self):
        response = self.client.get(reverse('get_library_type'), {
            'library_protocol_id': self.library_protocol.pk
        })

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), [{
            'id': self.library_type.pk,
            'name': self.library_type.name,
        }])

    def test_missing_or_empty_library_protocol_id(self):
        response = self.client.get(reverse('get_library_type'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'[]')

    def test_non_existing_library_protocol_id(self):
        response = self.client.get(reverse('get_library_type'), {
            'library_protocol_id': '-1'
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'[]')


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

        self.f_1 = FileLibrary(name='File1', file=ContentFile(b'file1'))
        self.f_2 = FileLibrary(name='File2', file=ContentFile(b'file2'))
        self.f_1.save()
        self.f_2.save()

        self.test_library = Library(
            name='Library_edit',
            organism_id=self.organism.pk,
            concentration=1.0,
            concentration_method_id=self.method.pk,
            dna_dissolved_in='dna',
            sample_volume=1,
            read_length_id=self.read_length.pk,
            sequencing_depth=1,
            library_protocol_id=self.library_protocol.pk,
            library_type_id=self.library_type.pk,
            enrichment_cycles=1,
            index_type_id=self.index_type.pk,
            index_reads=0,
            mean_fragment_size=1,
        )
        self.test_library.save()
        self.test_library.files.add(*[self.f_1.pk, self.f_2.pk])

    def test_save_ok(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {
            'mode': 'add',
            'name': 'Library_add',
            'library_protocol': self.library_protocol.pk,
            'library_type': self.library_type.pk,
            'enrichment_cycles': '1',
            'organism': self.organism.pk,
            'index_type': self.index_type.pk,
            'index_reads': '0',
            'index_i7': '',
            'index_i5': '',
            'equal_representation_nucleotides': 'false',
            'dna_dissolved_in': '1',
            'concentration': '1.0',
            'concentration_method': self.method.pk,
            'sample_volume': '1',
            'mean_fragment_size': '1',
            'qpcr_result': '1',
            'read_length': self.read_length.pk,
            'sequencing_depth': '1',
            'comments': '',
            'files': '[%s]' % self.f_1.pk,
        })
        self.assertEqual(response.status_code, 200)
        library = Library.objects.get(name='Library_add')
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True,
            'error': '',
            'data': {
                'name': library.name,
                'libraryId': library.pk,
                'barcode': library.barcode,
                'recordType': 'L',
            },
        })

    def test_missing_or_invalid_fields(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {
            'mode': 'add',  # works for 'edit' too
            'name': 'Library',
        })
        self.assertEqual(response.status_code, 200)

    def test_edit_ok(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {
            'mode': 'edit',
            'library_id': self.test_library.pk,
            'name': 'Library_edit_new',
            'library_protocol': self.library_protocol.pk,
            'library_type': self.library_type.pk,
            'enrichment_cycles': '1',
            'organism': self.organism.pk,
            'index_type': self.index_type.pk,
            'index_reads': '0',
            'index_i7': '',
            'index_i5': '',
            'equal_representation_nucleotides': 'false',
            'dna_dissolved_in': '1',
            'concentration': '1.0',
            'concentration_method': self.method.pk,
            'sample_volume': '1',
            'mean_fragment_size': '1',
            'qpcr_result': '1',
            'read_length': self.read_length.pk,
            'sequencing_depth': '1',
            'comments': '',
            'files': '[%s]' % self.f_1.pk,
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True,
            'error': '',
            'data': [],
        })

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('save_library'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Wrong HTTP method.',
            'data': [],
        })

    def test_wrong_or_missing_mode(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Wrong or missing mode.',
            'data': [],
        })

    def test_missing_or_empty_library_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {'mode': 'edit'})
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.content, b'[]')

    def test_non_existing_library_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_library'), {
            'mode': 'edit',
            'library_id': '-1',
        })
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.content, b'[]')


class DeleteLibraryTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

        self.library = Library.get_test_library('Library')
        self.library.save()

    def test_delete_library_ok(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_library'), {
            'record_id': self.library.pk
        })
        self.assertEqual(response.status_code, 200)

    def test_missing_or_empty_library_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_library'))
        self.assertEqual(response.status_code, 200)

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('delete_library'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Wrong HTTP method.',
        })
