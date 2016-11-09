from django.conf.urls import url
from pooling import views


urlpatterns = [
    # Index Generator
    url(r'^get_pooling_tree/$', views.get_pooling_tree, name='get_pooling_tree'),
    url(r'^save_pool/$', views.save_pool, name='save_pool'),
    url(r'^generate_indices/$', views.generate_indices, name='generate_indices'),
    url(r'^update_sequencing_run_condition/$', views.update_sequencing_run_condition, name='update_sequencing_run_condition'),
    url(r'^update_index_type/$', views.update_index_type, name='update_index_type'),

    # Library Preparation
    url(r'^get_library_preparation/$', views.get_library_preparation, name='get_library_preparation'),
]
