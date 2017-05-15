from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^pooling_tree/$', views.pooling_tree, name='pooling_tree'),
    url(r'^get_pool_sizes/$', views.get_pool_sizes, name='get_pool_sizes'),

    url(r'^update_read_length/$', views.update_read_length, name='update_read_length'),
    url(r'^update_index_type/$', views.update_index_type, name='update_index_type'),
    url(r'^generate_indices/$', views.generate_indices, name='generate_indices'),
    url(r'^save_pool/$', views.save_pool, name='save_pool'),
]
