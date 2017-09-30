import json

from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse

from common.tests import BaseTestCase
from request.models import Request
from library_sample_shared.models import (Organism, ConcentrationMethod,
                                          ReadLength, LibraryProtocol,
                                          LibraryType, IndexType)
from library.models import Library
from sample.models import Sample, NucleicAcidType

User = get_user_model()


def create_library(name):
    organism = Organism(name='Organism')
    organism.save()

    concentration_method = ConcentrationMethod(name='Concentration Method')
    concentration_method.save()

    read_length = ReadLength(name='Read Length')
    read_length.save()

    library_protocol = LibraryProtocol(
        name='Protocol',
        type='DNA',
        provider='-',
        catalog='-',
        explanation='-',
        input_requirements='-',
        typical_application='-',
    )
    library_protocol.save()

    library_type = LibraryType(name='Library Type')
    library_type.save()
    library_type.library_protocol.add(library_protocol)

    index_type = IndexType(name='Index Type')
    index_type.save()

    library = Library(
        name=name,
        organism_id=organism.pk,
        concentration=1.0,
        concentration_method_id=concentration_method.pk,
        read_length_id=read_length.pk,
        sequencing_depth=1,
        library_protocol_id=library_protocol.pk,
        library_type_id=library_type.pk,
        amplification_cycles=1,
        index_type_id=index_type.pk,
        index_reads=0,
        mean_fragment_size=1,
    )
    library.save()

    return library


def create_sample(name):
    organism = Organism(name='Organism')
    organism.save()

    concentration_method = ConcentrationMethod(name='Concentration Method')
    concentration_method.save()

    read_length = ReadLength(name='Read Length')
    read_length.save()

    library_protocol = LibraryProtocol(
        name='Protocol',
        type='DNA',
        provider='-',
        catalog='-',
        explanation='-',
        input_requirements='-',
        typical_application='-',
    )
    library_protocol.save()

    library_type = LibraryType(name='Library Type')
    library_type.save()
    library_type.library_protocol.add(library_protocol)

    nat = NucleicAcidType(name='Nucleic Acid Type')
    nat.save()

    sample = Sample(
        name=name,
        organism_id=organism.pk,
        concentration=1.0,
        concentration_method_id=concentration_method.pk,
        read_length_id=read_length.pk,
        sequencing_depth=1,
        library_protocol_id=library_protocol.pk,
        library_type_id=library_type.pk,
        nucleic_acid_type_id=nat.pk,
    )
    sample.save()

    return sample


# Views


class TestLibrariesSamples(BaseTestCase):
    """ Tests for the libraries and samples. """

    def setUp(self):
        user = self._create_user('foo@bar.io', 'foo-foo')
        self.client.login(email='foo@bar.io', password='foo-foo')

        self.library = create_library(self._get_random_name())
        self.sample = create_sample(self._get_random_name())

        self.request = Request(user=user)
        self.request.save()
        self.request.libraries.add(self.library)
        self.request.samples.add(self.sample)

    def test_libraries_and_samples_list(self):
        """ Ensure get all libraries and samples works correctly. """
        response = self.client.get(reverse('libraries-and-samples-list'))
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['name'], self.library.name)
        self.assertEqual(data[1]['name'], self.sample.name)


class TestLibraries(BaseTestCase):
    """ Tests for the libraries and samples. """

    def setUp(self):
        user = self._create_user('foo@bar.io', 'foo-foo')
        self.client.login(email='foo@bar.io', password='foo-foo')

        self.library = create_library(self._get_random_name())
        self.request = Request(user=user)
        self.request.save()
        self.request.libraries.add(self.library)

    def test_single_library(self):
        """ Ensure get single library behaves correctly. """
        response = self.client.get(reverse(
            'libraries-detail',
            kwargs={'pk': self.library.pk},
        ))
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn(self.library.name, data['data']['name'])

    def test_single_library_no_id(self):
        """ Ensure error is thrown if an id is not provided. """
        response = self.client.get(reverse(
            'libraries-detail',
            kwargs={'pk': 'blah'},
        ))
        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('Id is not provided.', data['message'])

    def test_single_library_incorrect_id(self):
        """ Ensure error is thrown if the id does not exist. """
        response = self.client.get(reverse(
            'libraries-detail',
            kwargs={'pk': -1},
        ))
        data = response.json()
        self.assertEqual(response.status_code, 404)
        self.assertFalse(data['success'])
        self.assertIn('Library does not exist.', data['message'])

    def test_add_library(self):
        """ Ensure add library behaves correctly. """
        name = self._get_random_name()
        response = self.client.post(reverse('libraries-list'), {
            'data': json.dumps([{
                'name': name,
                'organism': self.library.organism.pk,
                'concentration': 1.0,
                'concentration_method': self.library.concentration_method.pk,
                'read_length': self.library.read_length.pk,
                'sequencing_depth': 1,
                'library_protocol': self.library.library_protocol.pk,
                'library_type': self.library.library_type.pk,
                'amplification_cycles': 1,
                'index_type': self.library.index_type.pk,
                'index_reads': 0,
                'mean_fragment_size': 1,
            }])
        })
        data = response.json()
        self.assertEqual(response.status_code, 201)
        self.assertTrue(data['success'])
        self.assertEqual(name, data['data'][0]['name'])
        self.assertEqual('L', data['data'][0]['record_type'])

    def test_add_library_contains_invalid(self):
        """ Ensure add library containing invalid data behaves correctly. """
        name = self._get_random_name()
        response = self.client.post(reverse('libraries-list'), {
            'data': json.dumps([{
                'name': name,
                'organism': self.library.organism.pk,
                'concentration': 1.0,
                'concentration_method': self.library.concentration_method.pk,
                'read_length': self.library.read_length.pk,
                'sequencing_depth': 1,
                'library_protocol': self.library.library_protocol.pk,
                'library_type': self.library.library_type.pk,
                'amplification_cycles': 1,
                'index_type': self.library.index_type.pk,
                'index_reads': 0,
                'mean_fragment_size': 1,
            }, {
                'name': self._get_random_name(),
                'concentration': 1.0,
                'sequencing_depth': 1,
                'amplification_cycles': 1,
                'index_reads': 0,
                'mean_fragment_size': 1,
            }])
        })
        data = response.json()
        self.assertEqual(response.status_code, 201)
        self.assertTrue(data['success'])
        self.assertIn('Invalid payload. Some records cannot be added.',
                      data['message'])
        self.assertEqual(len(data['data']), 1)
        self.assertEqual(name, data['data'][0]['name'])

    def test_add_library_invalid_json(self):
        """ Ensure error is thrown if the JSON object is empty. """
        response = self.client.post(reverse('libraries-list'), {})
        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('Invalid payload.', data['message'])

    def test_add_library_invalid_data(self):
        """ Ensure error is thrown if the JSON object is empty. """
        response = self.client.post(reverse('libraries-list'), {
            'data': json.dumps([{
                'name': self._get_random_name(),
            }])
        })
        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('Invalid payload.', data['message'])

    def test_update_library(self):
        """ Ensure update library behaves correctly. """
        library = create_library(self._get_random_name())
        new_name = self._get_random_name()

        response = self.client.post(reverse('libraries-edit'), {
            'data': json.dumps([{
                'name': new_name,
                'id': library.pk,
                'library_id': library.pk,
                'organism': library.organism.pk,
                'concentration': 1.0,
                'concentration_method': library.concentration_method.pk,
                'read_length': library.read_length.pk,
                'sequencing_depth': 1,
                'library_protocol': library.library_protocol.pk,
                'library_type': library.library_type.pk,
                'amplification_cycles': 1,
                'index_type': library.index_type.pk,
                'index_reads': 0,
                'mean_fragment_size': 1,
            }])
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertEqual(Library.objects.get(pk=library.pk).name, new_name)

    def test_update_library_contains_invalid(self):
        """ Ensure update library containing invalid data behaves correctly."""
        library1 = create_library(self._get_random_name())
        library2 = create_library(self._get_random_name())
        new_name1 = self._get_random_name()
        new_name2 = self._get_random_name()

        response = self.client.post(reverse('libraries-edit'), {
            'data': json.dumps([{
                'name': new_name1,
                'id': library1.pk,
                'library_id': library1.pk,
                'organism': library1.organism.pk,
                'concentration': 1.0,
                'concentration_method': library1.concentration_method.pk,
                'read_length': library1.read_length.pk,
                'sequencing_depth': 1,
                'library_protocol': library1.library_protocol.pk,
                'library_type': library1.library_type.pk,
                'amplification_cycles': 1,
                'index_type': library1.index_type.pk,
                'index_reads': 0,
                'mean_fragment_size': 1,
            }, {
                'name': new_name2,
                'id': library2.pk,
                'library_id': library2.pk,
                'concentration': 2.0,
                'sequencing_depth': 2,
                'amplification_cycles': 2,
                'index_reads': 0,
                'mean_fragment_size': 2,
            }])
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn('Invalid payload. Some records cannot be updated.',
                      data['message'])
        self.assertEqual(Library.objects.get(pk=library1.pk).name, new_name1)
        self.assertEqual(Library.objects.get(
            pk=library2.pk).name, library2.name)

    # def test_update_library_non_staff(self):
    #     """
    #     Ensure a non-staff user cannot update a library created by
    #     another user.
    #     """
    #     self._create_user('test_user@test.com', 'foo-foo', False)
    #     self.client.login(email='test_user@test.com', password='foo-foo')
    #     pass

    def test_delete_library(self):
        """ Ensure delete library behaves correctly. """
        library = create_library(self._get_random_name())
        response = self.client.delete(reverse(
            'libraries-detail',
            kwargs={'pk': library.pk},
        ))
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])

    def test_delete_library_no_id(self):
        """ Ensure error is thrown if an id is not provided. """
        response = self.client.delete(reverse(
            'libraries-detail',
            kwargs={'pk': 'blah'},
        ))
        data = response.json()
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('Id is not provided.', data['message'])

    def test_delete_library_incorrect_id(self):
        """ Ensure error is thrown if the id does not exist. """
        response = self.client.delete(reverse(
            'libraries-detail',
            kwargs={'pk': -1},
        ))
        data = response.json()
        self.assertEqual(response.status_code, 404)
        self.assertFalse(data['success'])
        self.assertIn('Library does not exist.', data['message'])
