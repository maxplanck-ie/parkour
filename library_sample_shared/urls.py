from django.conf.urls import url
from .models import IndexI7, IndexI5
from . import views


urlpatterns = [
    url(r'^get_index_types/$', views.get_index_types, name='get_index_types'),
    url(r'^get_index_i7/$', views.IndexStoreView.as_view(model=IndexI7), name='get_index_i7'),
    url(r'^get_index_i5/$', views.IndexStoreView.as_view(model=IndexI5), name='get_index_i5'),
]
