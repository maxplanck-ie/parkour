import json

from django.core.urlresolvers import reverse

from common.tests import BaseTestCase
from sample.tests import create_sample
from request.models import Request
from index_generator.models import Pool, PoolSize
from .models import LibraryPreparation


# Models
# TODO: write models tests


# Views

class TestLibraryPreparation(BaseTestCase):

    def setUp(self):
        user = self._create_user('test@test.io', 'foo-bar')
        self.client.login(email='test@test.io', password='foo-bar')

        self.sample1 = create_sample(self._get_random_name(), status=2)
        self.sample1.save()

        # QC failed
        self.sample2 = create_sample(self._get_random_name(), status=-1)
        self.sample2.save()

        request = Request(user=user)
        request.save()
        request.samples.add(*[self.sample1, self.sample2])

        pool_size = PoolSize(size=25)
        pool_size.save()

        pool = Pool(user=user, size=pool_size)
        pool.save()
        pool.samples.add(*[self.sample1, self.sample2])

        self.sample1.is_pooled = True
        self.sample1.is_converted = True
        self.sample1.barcode = self.sample1.barcode.replace('S', 'L')
        self.sample1.save()

        self.sample2.is_pooled = True
        self.sample2.is_converted = True
        self.sample2.barcode = self.sample2.barcode.replace('S', 'L')
        self.sample2.save()

        self.library_preparation_obj1 = LibraryPreparation(sample=self.sample1)
        self.library_preparation_obj1.save()

        self.library_preparation_obj2 = LibraryPreparation(sample=self.sample2)
        self.library_preparation_obj2.save()

    def test_library_preparation_list(self):
        """ Ensure get library preparation list behaves correctly. """
        response = self.client.get(reverse('library-preparation-list'))
        data = response.json()
        objects = [x['name'] for x in data]
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.sample1.name, objects)
        self.assertNotIn(self.sample2.name, objects)
