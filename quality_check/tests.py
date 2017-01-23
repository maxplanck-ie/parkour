from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from request.models import Request
from library.models import Library
from sample.models import Sample

User = get_user_model()


# Views

class GetAllLibraries(TestCase):
    def setUp(self):
        user = User.objects.create_user(
            email='foo@bar.io', password='foo-foo', is_staff=True,
        )
        user.save()

        self.request = Request(user=user)
        self.request.save()

    def test_get_all(self):
        self.client.login(email='foo@bar.io', password='foo-foo')

        library = Library.get_test_library('Library1')
        library.status = 1
        library.save()

        sample = Sample.get_test_sample('Sample1')
        sample.status = 1
        sample.save()

        self.request.libraries.add(library)
        self.request.samples.add(sample)

        response = self.client.get(reverse('library.get_all'), {
            'quality_check': 'true'
        })
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.content, b'[]')

    def test_get_all_empty(self):
        self.client.login(email='foo@bar.io', password='foo-foo')

        library = Library.get_test_library('Library2')
        library.save()

        sample = Sample.get_test_sample('Sample2')
        sample.save()

        self.request.libraries.add(library)
        self.request.samples.add(sample)

        response = self.client.get(reverse('library.get_all'), {
            'quality_check': 'true'
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'[]')
