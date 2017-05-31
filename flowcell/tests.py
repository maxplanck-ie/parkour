from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from .models import Sequencer, Lane, Flowcell
from library_sample_shared.models import ReadLength
from index_generator.models import Pool, PoolSize
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


class LaneTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')

        pool_size = PoolSize(size=200)
        pool_size.save()

        pool = Pool(name='_Pool', user=user, size=pool_size)
        pool.save()

        self.lane = Lane(name='lane', pool=pool, loading_concentration=1.0)

    def test_lane_name(self):
        self.assertTrue(isinstance(self.lane, Lane))
        self.assertEqual(
            self.lane.__str__(),
            '%s: %s' % (self.lane.name, self.lane.pool.name)
        )


class FlowcellTest(TestCase):
    def setUp(self):
        sequencer = Sequencer(name='Seq', lanes=1, lane_capacity=200)
        self.flowcell = Flowcell(flowcell_id='fc', sequencer=sequencer)

    def test_flowcell_name(self):
        self.assertTrue(isinstance(self.flowcell, Flowcell))
        self.assertEqual(self.flowcell.__str__(), self.flowcell.flowcell_id)


# Views

class SequencerList(TestCase):
    def setUp(self):
        User.objects.create_user(email='foo@bar.io', password='foo-foo')

    def test_sequencer_list(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('sequencer_list'))
        self.assertNotEqual(len(response.content), b'[]')
        self.assertEqual(response.status_code, 200)


class PoolListLibraries(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo',
                                        is_staff=True)

        pool_size = PoolSize(size=200)
        pool_size.save()

        pool = Pool(name='_Foo', user=user, size=pool_size)
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


class PoolListSamples(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo',
                                        is_staff=True)

        pool_size = PoolSize(size=200)
        pool_size.save()

        pool = Pool(name='_Foo', user=user, size=pool_size)
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


# class PoolInfo(TestCase):
#     def setUp(self):
#         user = User.objects.create_user(email='foo@bar.io', password='foo-foo',
#                                         is_staff=True)
#
#         pool_size = PoolSize(size=200)
#         pool_size.save()
#
#         pool = Pool(name='_Foo', user=user, size=pool_size)
#         pool.save()
#
#         library_1 = Library.get_test_library('Library1')
#         library_2 = Library.get_test_library('Library2')
#         library_1.save()
#         library_2.save()
#
#         sample_1 = Sample.get_test_sample('Sample1')
#         sample_2 = Sample.get_test_sample('Sample2')
#         sample_1.save()
#         sample_2.save()
#
#         pool.libraries.add(library_1)
#         pool.samples.add(sample_1)
#
#         self.request = Request(user=user)
#         self.request.save()
#         self.request.libraries.add(*[library_1, library_2])
#         self.request.samples.add(*[sample_1, sample_2])
#
#     def test_pool_info(self):
#         self.client.login(email='foo@bar.io', password='foo-foo')
#         response = self.client.get(reverse('pool_info'), {'pool_id': 1})
#
#         self.assertNotEqual(response.content, b'[]')
#         self.assertEqual(response.status_code, 200)
