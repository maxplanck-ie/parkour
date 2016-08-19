from django.test import TestCase
from django.core.urlresolvers import resolve, reverse
from django.contrib.auth.models import User


class UrlTestCase(TestCase):
    def test(self):
        resolver = resolve('/')
        self.assertEqual(resolver.view_name, 'index')


class IndexViewTestCase(TestCase):
    def setUp(self):
        user = User.objects.create_user(username='foo', password='bar')

    def test_get(self):
        self.client.login(username='foo', password='bar')
        response = self.client.get(reverse('index'), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'index.html')
