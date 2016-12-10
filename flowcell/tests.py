from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from .models import Sequencer
from index_generator.models import Pool
from library.models import Library
from sample.models import Sample
from request.models import Request

User = get_user_model()


# Models

class SequencerTest(TestCase):
    def setUp(self):
        self.sequencer = Sequencer(name='Seq', lanes=1, lane_capacity=200)

    def test_sequencer_name(self):
        self.assertTrue(isinstance(self.sequencer, Sequencer))
        self.assertEqual(self.sequencer.__str__(), self.sequencer.name)


# Views

class SequencerList(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

    def test_sequencer_list(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('sequencer_list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['content-type'], 'application/json')
        self.assertNotEqual(len(response.content), 0)


class PoolListLibraries(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')
        pool = Pool(name='_Foo')
        pool.save()

        library = Library.get_test_library('Library')
        library.save()
        pool.libraries.add(library)

    def test_pool_list(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('pool_list'))
        pools = Pool.objects.prefetch_related('libraries')
        library = pools[0].libraries.all()[0]

        self.assertEqual(library.read_length_id, 1)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['content-type'], 'application/json')


class PoolListSamples(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')
        pool = Pool(name='_Foo')
        pool.save()

        sample = Sample.get_test_sample('Sample')
        sample.save()
        pool.samples.add(sample)

    def test_pool_list(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('pool_list'))
        pools = Pool.objects.prefetch_related('libraries')
        sample = pools[0].samples.all()[0]

        self.assertEqual(sample.read_length_id, 1)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['content-type'], 'application/json')


class PoolInfo(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        pool = Pool(name='_Foo')
        pool.save()

        library_1 = Library.get_test_library('Library1')
        library_2 = Library.get_test_library('Library2')
        library_1.save()
        library_2.save()

        sample_1 = Sample.get_test_sample('Sample1')
        sample_2 = Sample.get_test_sample('Sample2')
        sample_1.save()
        sample_2.save()

        pool.libraries.add(library_1)
        pool.samples.add(sample_1)

        self.request = Request(user=user)
        self.request.save()
        self.request.libraries.add(*[library_1, library_2])
        self.request.samples.add(*[sample_1, sample_2])

    def test_pool_info(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('pool_info'), {'pool_id': 1})

        self.assertNotEqual(response.content, b'[]')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['content-type'], 'application/json')
