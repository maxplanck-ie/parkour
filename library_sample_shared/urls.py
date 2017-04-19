from django.conf.urls import url
from .models import ConcentrationMethod, ReadLength, IndexI7, IndexI5
from . import views


urlpatterns = [
    url(r'^get_organisms/$', views.get_organisms, name='get_organisms'),
    url(r'^get_concentration_methods/$', views.SimpleStoreView.as_view(model=ConcentrationMethod), name='get_concentration_methods'),
    url(r'^get_read_lengths/$', views.SimpleStoreView.as_view(model=ReadLength), name='get_read_lengths'),
    url(r'^get_index_types/$', views.get_index_types, name='get_index_types'),
    url(r'^get_index_i7/$', views.IndexStoreView.as_view(model=IndexI7), name='get_index_i7'),
    url(r'^get_index_i5/$', views.IndexStoreView.as_view(model=IndexI5), name='get_index_i5'),

    url(r'^get_library_protocols/$', views.get_library_protocols, name='get_library_protocols'),
    url(r'^get_library_types/$', views.get_library_types, name='get_library_types'),
]
