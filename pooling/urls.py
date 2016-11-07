from django.conf.urls import url
from pooling import views


urlpatterns = [
    url(r'^get_pooling_tree/$', views.get_pooling_tree, name='get_pooling_tree'),
    url(r'^save_pool/$', views.save_pool, name='save_pool'),
    url(r'^generate_indices/$', views.generate_indices, name='generate_indices'),
    url(r'^update_sequencing_run_condition/$', views.update_sequencing_run_condition, name='update_sequencing_run_condition'),
]
