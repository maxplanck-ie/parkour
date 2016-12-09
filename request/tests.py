from django.contrib.auth import get_user_model
from django.test import TestCase
from .models import Request

User = get_user_model()


class RequestModelTestCase(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')
        self.request = Request.objects.create(user=user)

    def test_request(self):
        self.assertEqual(str(self.request), self.request.name)
