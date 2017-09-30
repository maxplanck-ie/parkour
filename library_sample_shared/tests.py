from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from common.tests import BaseTestCase
from .models import (Organism, ConcentrationMethod, ReadLength, IndexType,
                     IndexI7, GenericIndex, BarcodeCounter, LibraryProtocol,
                     LibraryType, GenericLibrarySample)

User = get_user_model()


# Models

class OrganismTest(TestCase):
    def setUp(self):
        self.organism = Organism(name='mouse')

    def test_organism_name(self):
        self.assertTrue(isinstance(self.organism, Organism))
        self.assertEqual(self.organism.__str__(), self.organism.name)


class ConcentrationMethodTest(TestCase):
    def setUp(self):
        self.method = ConcentrationMethod(name='fluorography')

    def test_concentration_method_name(self):
        self.assertTrue(isinstance(self.method, ConcentrationMethod))
        self.assertEqual(self.method.__str__(), self.method.name)


class ReadLengthTest(TestCase):
    def setUp(self):
        self.read_length = ReadLength(name='1x50')

    def test_read_length_name(self):
        self.assertTrue(isinstance(self.read_length, ReadLength))
        self.assertEqual(self.read_length.__str__(), self.read_length.name)


class IndexTypeTest(TestCase):
    def setUp(self):
        self.index_type = IndexType(name='Nextera')

    def test_index_type_name(self):
        self.assertTrue(isinstance(self.index_type, IndexType))
        self.assertEqual(self.index_type.__str__(), self.index_type.name)


class GenericIndexTest(TestCase):
    def setUp(self):
        self.index1 = IndexI7(index_id='I001', index='ATCACG')
        self.index2 = GenericIndex(index_id='I002', index='ATCACG')
        self.index1.save()

        self.index_type = IndexType(name='Index Type', is_index_i7=True)
        self.index_type.save()
        self.index_type.indices_i7.add(self.index1)

    def test_generic_index_id(self):
        self.assertTrue(isinstance(self.index1, GenericIndex))
        self.assertEqual(self.index1.__str__(), self.index1.index_id)
        self.assertEqual(self.index1.type(), self.index_type.name)

    def test_no_index_type(self):
        self.assertEqual(self.index2.type(), '')


class BarcodeCounterTest(TestCase):
    def setUp(self):
        counter = BarcodeCounter.load()
        counter.increment()
        counter.save()

    def test_barcode_counter_name(self):
        counter = BarcodeCounter.load()
        self.assertEqual(counter.__str__(), str(counter.counter))


class LibraryProtocolTest(TestCase):
    def setUp(self):
        self.library_protocol = LibraryProtocol(
            name='Protocol',
            provider='',
            catalog='',
            explanation='',
            input_requirements='',
            typical_application='',
        )

    def test_library_protocol_name(self):
        self.assertTrue(isinstance(self.library_protocol, LibraryProtocol))
        self.assertEqual(
            self.library_protocol.__str__(),
            self.library_protocol.name,
        )


class LibraryTypeTest(TestCase):
    def setUp(self):
        self.library_type = LibraryType(name='Library Type')

    def test_library_type_name(self):
        self.assertTrue(isinstance(self.library_type, LibraryType))
        self.assertEqual(self.library_type.__str__(), self.library_type.name)


class GenericLibrarySampleTest(TestCase):
    def setUp(self):
        organism = Organism(name='mouse')
        concentration_method = ConcentrationMethod(name='fluorography')
        read_length = ReadLength(name='1x50')

        self.library = GenericLibrarySample(
            name='Library1',
            organism=organism,
            concentration=1.0,
            concentration_method=concentration_method,
            read_length=read_length,
            sequencing_depth=1
        )

    def test_generic_library_sample_name(self):
        self.assertTrue(isinstance(self.library, GenericLibrarySample))
        self.assertEqual(self.library.__str__(), self.library.name)


# Views

class TestOrganisms(BaseTestCase):
    def setUp(self):
        self._create_user('foo@bar.io', 'foo-foo')
        self.client.login(email='foo@bar.io', password='foo-foo')

        self.organism = Organism(name=self._get_random_name())
        self.organism.save()

    def test_organisms_list(self):
        """ Ensure get organisms behaves correctly. """
        response = self.client.get(reverse('organism-list'))
        data = response.json()
        organisms = [x['name'] for x in data]
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.organism.name, organisms)


class TestIndexTypes(BaseTestCase):
    def setUp(self):
        self._create_user('foo@bar.io', 'foo-foo')
        self.client.login(email='foo@bar.io', password='foo-foo')

        self.index_type = IndexType(name=self._get_random_name())
        self.index_type.save()

    def test_index_type_list(self):
        """ Ensure get index types behaves correctly. """
        response = self.client.get(reverse('index-type-list'))
        data = response.json()
        index_types = [x['name'] for x in data]
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.index_type.name, index_types)


class TestLibraryProtocols(BaseTestCase):
    """ Tests for library protocols. """

    def setUp(self):
        self._create_user('foo@bar.io', 'foo-foo')
        self.client.login(email='foo@bar.io', password='foo-foo')

        self.library_protocol1 = LibraryProtocol(
            name=self._get_random_name(),
            type='DNA',
            provider='-',
            catalog='-',
            explanation='-',
            input_requirements='-',
            typical_application='-',
        )
        self.library_protocol2 = LibraryProtocol(
            name=self._get_random_name(),
            type='RNA',
            provider='-',
            catalog='-',
            explanation='-',
            input_requirements='-',
            typical_application='-',
        )
        self.library_protocol1.save()
        self.library_protocol2.save()

    def test_library_protocol_list(self):
        """ Ensure get library protocols behaves correctly. """
        response = self.client.get(reverse('library-protocol-list'))
        data = response.json()
        protocols = [x['name'] for x in data]
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.library_protocol1.name, protocols)
        self.assertIn(self.library_protocol2.name, protocols)

    def test_library_protocol_with_type_list(self):
        """
        Ensure get library protocols given nucleic acid type behaves correctly.
        """
        response = self.client.get(reverse('library-protocol-list'), {
            'type': 'DNA',
        })
        data = response.json()
        protocols = [x['name'] for x in data]
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.library_protocol1.name, protocols)
        self.assertNotIn(self.library_protocol2.name, protocols)
        self.client.get(reverse('library-protocol-list'), {type: 'DNA'})


class TestLibraryTypes(BaseTestCase):
    """ Tests for library types. """

    def setUp(self):
        self._create_user('foo@bar.io', 'foo-foo')
        self.client.login(email='foo@bar.io', password='foo-foo')

        self.library_protocol = LibraryProtocol(
            name=self._get_random_name(),
            type='DNA',
            provider='-',
            catalog='-',
            explanation='-',
            input_requirements='-',
            typical_application='-',
        )
        self.library_protocol.save()

        self.library_type = LibraryType(name=self._get_random_name())
        self.library_type.save()
        self.library_type.library_protocol.add(self.library_protocol)

    def test_library_type_list(self):
        """ Ensure get library types behaves correctly. """
        response = self.client.get(reverse('library-type-list'))
        data = response.json()
        library_types = [x['name'] for x in data]
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.library_type.name, library_types)

    def test_library_type_with_protocol_list(self):
        """
        Ensure get library types given library protocol behaves correctly.
        """
        response = self.client.get(reverse('library-type-list'), {
            'library_protocol_id': self.library_protocol.pk,
        })
        data = response.json()
        library_types = [x['name'] for x in data]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(library_types), 2)  # +1 for 'Other'
        self.assertIn(self.library_type.name, library_types)

    def test_library_type_invalid_protocol(self):
        """
        Ensure get library types given invalid library protocol behaves
        correctly.
        """
        response = self.client.get(reverse('library-type-list'), {
            'library_protocol_id': 'blah',
        })
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data, [])
