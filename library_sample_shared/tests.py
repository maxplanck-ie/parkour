from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

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

class GetLibraryProtocolsTest(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

    def test_nucleic_acid_types(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('get_library_protocols'), {
            'type': 'DNA'
        })
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.content, b'[]')

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('get_library_protocols'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'[]')


class GetLibraryTypes(TestCase):
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

    def test_get_library_types_ok(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('get_library_types'), {
            'library_protocol_id': self.library_protocol.pk
        })

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, 'utf-8'), [
            {
                'id': self.library_type.pk,
                'name': 'Library Type',
                'protocol': [self.library_protocol.pk]
            },
            {
                'id': 1,
                'name': 'Other',
                'protocol': [self.library_protocol.pk]
            }
        ])

    def test_wrong_http_method(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.post(reverse('get_library_types'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'[]')
