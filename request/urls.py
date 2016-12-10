from django.conf.urls import url
from request import views


urlpatterns = [
    url(r'^get_all/$', views.get_all, name='request.get_all'),
    url(r'^libraries_and_samples/$', views.get_libraries_and_samples, name='get_libraries_and_samples'),
    url(r'^save/$', views.save_request, name='save_request'),
    url(r'^delete/$', views.delete_request, name='delete_request'),

    url(r'^generate_deep_sequencing_request/$', views.generate_deep_sequencing_request, name='generate_deep_sequencing_request'),
    url(r'^upload_deep_sequencing_request/$', views.upload_deep_sequencing_request, name='upload_deep_sequencing_request'),
]
