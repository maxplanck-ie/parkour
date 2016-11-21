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
    url(r'^edit_library_preparation/$', views.edit_library_preparation, name='edit_library_preparation'),
    url(r'^download_benchtop_protocol_xls/$', views.download_benchtop_protocol_xls, name='download_benchtop_protocol_xls'),
    url(r'^upload_library_preparation_file/$', views.upload_library_preparation_file, name='upload_library_preparation_file'),

    # Pooling
    url(r'^get_pooling/$', views.get_pooling, name='get_pooling'),
]
