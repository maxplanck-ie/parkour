from django.test import TestCase
from django.core.files.base import ContentFile
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from .models import SampleProtocol, NucleicAcidType, FileSample, Sample
from library_sample_shared.models import (Organism, ConcentrationMethod,
                                          ReadLength)
import tempfile

User = get_user_model()


# Models

class SampleProtocolTest(TestCase):
    def setUp(self):
        self.sample_protocol = SampleProtocol(
            name='Protocol',
            provider='',
            catalog='',
            explanation='',
            input_requirements='',
            typical_application='',
        )

    def test_sample_protocol_name(self):
        self.assertTrue(isinstance(self.sample_protocol, SampleProtocol))
        self.assertEqual(
            self.sample_protocol.__str__(),
            self.sample_protocol.name,
        )


class NucleicAcidTypeTest(TestCase):
    def setUp(self):
        self.nucleic_acid_type = NucleicAcidType(name='NAT')

    def test_sample_protocol_name(self):
        self.assertTrue(isinstance(self.nucleic_acid_type, NucleicAcidType))
        self.assertEqual(
            self.nucleic_acid_type.__str__(),
            self.nucleic_acid_type.name,
        )


class FileSampleTest(TestCase):
    def setUp(self):
        tmp_file = tempfile.NamedTemporaryFile()
        self.file = FileSample(name='File', file=tmp_file)
        tmp_file.close()

    def test_file_sample(self):
        self.assertTrue(isinstance(self.file, FileSample))
        self.assertEqual(self.file.__str__(), self.file.name)


# Views

class GetNucleicAcidTypesTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

    def test_nucleic_acid_types(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('get_nucleic_acid_types'))
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(len(response.content), b'[]')


class GetSampleProtocolsTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

    def test_nucleic_acid_types(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('get_sample_protocols'), {
            'type': 'DNA'
        })
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.content, b'[]')

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('get_sample_protocols'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'[]')

    def test_missing_sample_type(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('get_sample_protocols'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'[]')


class SaveSampleTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

        self.sample_protocol = SampleProtocol(
            name='Protocol',
            provider='',
            catalog='',
            explanation='',
            input_requirements='',
            typical_application='',
        )
        self.sample_protocol.save()

        self.nucleic_acid_type = NucleicAcidType(name='NAT')
        self.nucleic_acid_type.save()

        self.organism = Organism(name='Human')
        self.organism.save()

        self.method = ConcentrationMethod(name='fluorography')
        self.method.save()

        self.read_length = ReadLength(name='1x50')
        self.read_length.save()

        self.f_1 = FileSample(name='File1', file=ContentFile(b'file1'))
        self.f_2 = FileSample(name='File2', file=ContentFile(b'file2'))
        self.f_1.save()
        self.f_2.save()

        self.test_sample = Sample(
            name='Sample_edit',
            organism_id=self.organism.pk,
            dna_dissolved_in='dna',
            concentration=1.0,
            concentration_method_id=self.method.pk,
            sample_volume=1,
            read_length_id=self.read_length.pk,
            sequencing_depth=1,
            nucleic_acid_type_id=self.nucleic_acid_type.pk,
            sample_protocol_id=self.sample_protocol.pk,
        )
        self.test_sample.save()
        self.test_sample.files.add(*[self.f_1.pk, self.f_2.pk])

    def test_save_ok(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_sample'), {
            'mode': 'add',
            'name': 'Sample_add',
            'organism': self.organism.pk,
            'dna_dissolved_in': 'dna',
            'concentration': 1.0,
            'concentration_method': self.method.pk,
            'sample_volume': 1,
            'read_length': self.read_length.pk,
            'sequencing_depth': 1,
            'nucleic_acid_type': self.nucleic_acid_type.pk,
            'sample_protocol': self.sample_protocol.pk,
            'files': '[%s]' % self.f_1.pk
        })
        self.assertEqual(response.status_code, 200)
        sample = Sample.objects.get(name='Sample_add')
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True,
            'error': '',
            'data': {
                'name': sample.name,
                'sampleId': sample.pk,
                'barcode': sample.barcode,
                'recordType': 'S',
            },
        })

    def test_missing_or_invalid_fields(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_sample'), {
            'mode': 'add',  # works for 'edit' too
            'name': 'Sample',
        })
        self.assertEqual(response.status_code, 200)

    def test_edit_ok(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_sample'), {
            'mode': 'edit',
            'sample_id': self.test_sample.pk,
            'name': 'Sample_edit_new',
            'organism': self.organism.pk,
            'equal_representation_nucleotides': 'false',
            'dna_dissolved_in': '1',
            'concentration': '1.0',
            'concentration_method': self.method.pk,
            'sample_volume': '1',
            'read_length': self.read_length.pk,
            'sequencing_depth': '1',
            'nucleic_acid_type': self.nucleic_acid_type.pk,
            'sample_protocol': self.sample_protocol.pk,
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
        response = self.client.get(reverse('save_sample'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Wrong HTTP method.',
            'data': [],
        })

    def test_wrong_or_missing_mode(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_sample'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False,
            'error': 'Wrong or missing mode.',
            'data': [],
        })

    def test_missing_or_empty_sample_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_sample'), {'mode': 'edit'})
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.content, b'[]')

    def test_non_existing_library_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_sample'), {
            'mode': 'edit',
            'sample_id': '-1',
        })
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.content, b'[]')


class UploadFilesTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

    def test_upload_files(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        tmp_file = tempfile.NamedTemporaryFile()
        with open(tmp_file.name, 'rb') as fp:
            response = self.client.post(reverse('sample.upload_files'), {
                'files': [fp]
            }, format='miltipart')
        tmp_file.close()
        self.assertEqual(response.status_code, 200)


class GetFilesTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

        # TODO@me: fix creating a file, which must be physically located on a disk
        self.f = FileSample(name='File', file=ContentFile(b'file'))
        self.f.save()

    def test_get_files(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('sample.get_files'), {
            # 'file_ids': '[%s]' % self.f.pk
        })
        self.assertEqual(response.status_code, 200)


class DeleteSampleTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')
        self.sample = Sample.get_test_sample('Sample')
        self.sample.save()

    def test_delete_sample(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_sample'), {
            'record_id': self.sample.pk
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': True, 'error': '',
        })

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('delete_sample'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), {
            'success': False, 'error': 'Wrong HTTP method.',
        })

    def test_missing_or_empty_record_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_sample'))
        self.assertEqual(response.status_code, 200)

    def test_non_existing_record_id(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_sample'), {
            'record_id': '-1'
        })
        self.assertEqual(response.status_code, 200)
