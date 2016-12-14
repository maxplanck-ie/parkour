from django.test import TestCase
from django.core.files.base import ContentFile
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from .models import SampleProtocol, NucleicAcidType, FileSample, Sample

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
        self.assertNotEqual(len(response.content), b'[]')
        self.assertEqual(response.status_code, 200)


class GetSampleProtocolsTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

    def test_nucleic_acid_types(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('get_sample_protocols'), {
            'type': 'DNA'
        })
        self.assertNotEqual(len(response.content), b'[]')
        self.assertEqual(response.status_code, 200)


class SaveSampleTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

    def test_save_sample(self):
        """ Successfull 'save' test when everything is present. """
        self.client.login(email='foo@bar.io', password='foo-foo')

        f = FileSample(name='File', file=ContentFile(b'file'))
        f.save()

        response = self.client.post(reverse('save_sample'), {
            'mode': 'add',
            'name': 'Sample1',
            'organism': 1,
            'dna_dissolved_in': 'dna',
            'concentration': 1.0,
            'concentration_method': 1,
            'sample_volume': 1,
            'read_length': 1,
            'sequencing_depth': 1,
            'nucleic_acid_type': 1,
            'sample_protocol': 1,
            'files': '[%s]' % f.pk
        })
        self.assertEqual(response.status_code, 200)

    def test_update_sample(self):
        """ Updated 'name' and 'organism_id'. """
        self.client.login(email='foo@bar.io', password='foo-foo')

        f_1 = FileSample(name='File', file=ContentFile(b'file1'))
        f_2 = FileSample(name='File', file=ContentFile(b'file2'))
        f_1.save()
        f_2.save()

        sample = Sample.get_test_sample('Sample')
        sample.save()
        sample.files.add(*[f_1.pk, f_2.pk])

        response = self.client.post(reverse('save_sample'), {
            'mode': 'edit',
            'sample_id': sample.pk,
            'name': 'Sample1',
            'organism': 2,
            'dna_dissolved_in': 'dna',
            'concentration': 1.0,
            'concentration_method': 1,
            'sample_volume': 1,
            'read_length': 1,
            'sequencing_depth': 1,
            'nucleic_acid_type': 1,
            'sample_protocol': 1,
            'files': '[%s]' % f_1.pk
        })
        self.assertEqual(response.status_code, 200)

    def test_invalid_form(self):
        """
        Invalid form:
        - name is not unique
        - organism_id is empty,
        - sample_protocol = 0 doesn't exist
        - some fields are missing
        """
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_sample'), {
            'mode': 'add',
            'name': 'Sample',
            'organism': '',
            'sample_protocol': 0
        })
        self.assertEqual(response.status_code, 200)

    def test_exception(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('save_sample'), {
            'mode': 'edit',
            'sample_id': 0
        })
        self.assertEqual(response.status_code, 200)


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

    def test_exception(self):
        """ Empty or non-existing record_id. """
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('delete_sample'), {
            'record_id': 0
        })
        self.assertEqual(response.status_code, 200)
