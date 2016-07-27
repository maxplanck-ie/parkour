from django.conf.urls import url
from library.views import LibraryField


urlpatterns = [
    url(r'^get_library_protocols/$', LibraryField.as_view(), name='get_library_protocols'),
    url(r'^get_library_type/$', LibraryField.as_view(), name='get_library_type'),
    url(r'^get_organisms/$', LibraryField.as_view(), name='get_organisms'),
    url(r'^get_index_types/$', LibraryField.as_view(), name='get_index_types'),
    url(r'^get_index_i7/$', LibraryField.as_view(), name='get_index_i7'),
    url(r'^get_index_i5/$', LibraryField.as_view(), name='get_index_i5'),
]
