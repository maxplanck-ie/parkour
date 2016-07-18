from django.test import TestCase, Client
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


class GetUsernameTestCase(TestCase):
    def setUp(self):
        user = User.objects.create_user(username='foo', password='bar', first_name='Fooo')

    def test_get_username(self):
        self.client.login(username='foo', password='bar')
        response = self.client.get(reverse('get_username'), follow=True)
        user = User.objects.get(username='foo')
        self.assertContains(response, user.first_name)
