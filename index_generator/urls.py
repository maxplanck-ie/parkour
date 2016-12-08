from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^pooling_tree/$', views.pooling_tree, name='pooling_tree'),
    url(r'^update_sequencing_run_condition/$', views.update_sequencing_run_condition, name='update_sequencing_run_condition'),
    url(r'^update_index_type/$', views.update_index_type, name='update_index_type'),
    url(r'^generate_indices/$', views.generate_indices, name='generate_indices'),
    url(r'^save_pool/$', views.save_pool, name='save_pool'),
]
