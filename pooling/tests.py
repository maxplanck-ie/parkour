from django.test import TestCase

from common.utils import get_random_name
from library.tests import create_library
from sample.tests import create_sample

from .models import Pooling


def create_pooling_object(name, add_library=False, add_sample=False):
    pooling_object = Pooling(name=name)
    pooling_object.save()

    if add_library:
        library = create_library(get_random_name(), 2)
        pooling_object.library = library
        pooling_object.save()

    if add_sample:
        sample = create_sample(get_random_name(), 3)
        pooling_object.sample = sample
        pooling_object.save()

    return pooling_object


# Models

class TestPoolingModel(TestCase):

    def setUp(self):
        self.pooling_obj = create_pooling_object(
            get_random_name(), add_library=True)

    def test_name(self):
        self.assertTrue(isinstance(self.pooling_obj, Pooling))
        self.assertEqual(self.pooling_obj.__str__(), '{0} ({1})'.format(
            self.pooling_obj.library.name,
            self.pooling_obj.library.pool.get().name,
        ))
