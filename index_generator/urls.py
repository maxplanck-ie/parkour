from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^get_all/$', views.get_all, name='index_generator.get_all'),
    url(r'^get_pool_sizes/$', views.get_pool_sizes, name='get_pool_sizes'),

    url(r'^update/$', views.update, name='index_generator.update'),
    url(r'^update_all/$', views.update_all, name='index_generator.update_all'),

    url(r'^generate_indices/$', views.generate_indices, name='generate_indices'),
    url(r'^save_pool/$', views.save_pool, name='save_pool'),
    url(r'^reset/$', views.reset, name='reset'),
]
