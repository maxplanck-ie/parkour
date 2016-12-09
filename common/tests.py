from django.test import TestCase
from django.core.urlresolvers import resolve, reverse
from django.contrib.auth import get_user_model

User = get_user_model()


# class UrlTestCase(TestCase):
#     def test(self):
#         resolver = resolve('/')
#         self.assertEqual(resolver.view_name, 'index')


class IndexViewTestCase(TestCase):
    def setUp(self):
        user = User.objects.create_user(email='foo@bar.io', password='foo-foo')

    def test_get(self):
        self.client.login(email='foo@bar.io', password='foo-foo')
        response = self.client.get(reverse('index'), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'index.html')
