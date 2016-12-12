from django.test import TestCase

from .models import Pooling
from library.models import Library


# Models

class PoolingTest(TestCase):
    def setUp(self):
        self.library = Library.get_test_library('Library')
        self.pooling = Pooling(library=self.library)

    def test_pooling_name(self):
        self.assertTrue(isinstance(self.pooling, Pooling))
        self.assertEqual(self.pooling.__str__(), self.library.name)
