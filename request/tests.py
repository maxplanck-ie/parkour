from django.test import TestCase
from request.models import Request


class RequestModelTestCase(TestCase):
    def setUp(self):
        self.request = Request.objects.create()

    def test(self):
        self.assertEqual(str(self.request), self.request.name)
