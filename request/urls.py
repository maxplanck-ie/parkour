from django.conf.urls import url
from request import views


urlpatterns = [
    url(r'^save/$', views.save_request, name='save_request'),
    url(r'^delete/$', views.delete_request, name='delete_request'),

    url(r'^generate_deep_sequencing_request/$', views.generate_deep_sequencing_request, name='generate_deep_sequencing_request'),
    url(r'^upload_deep_sequencing_request/$', views.upload_deep_sequencing_request, name='upload_deep_sequencing_request'),

    url(r'^upload_files/$', views.upload_files, name='upload_files'),
    url(r'^send_email/$', views.send_email, name='send_email'),
]
