from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^nucleic_acid_types/$', views.get_nucleic_acid_types, name='get_nucleic_acid_types'),
    url(r'^sample_protocols/$', views.get_sample_protocols, name='get_sample_protocols'),

    url(r'^save/$', views.save_sample, name='save_sample'),
    url(r'^delete/$', views.delete_sample, name='delete_sample'),

    url(r'^upload_files/$', views.upload_files, name='sample.upload_files'),
    url(r'^get_files/$', views.get_files, name='sample.get_files'),
]
