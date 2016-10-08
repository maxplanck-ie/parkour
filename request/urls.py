from django.conf.urls import url
from request import views


urlpatterns = [
    url(r'^get_requests/$', views.get_requests, name='get_requests'),
    url(r'^save_request/$', views.save_request, name='save_request'),
    url(r'^delete_request/$', views.delete_request, name='delete_request'),

    url(r'^get_libraries_in_request/$', views.get_libraries_in_request, name='get_libraries_in_request'),

    url(r'^generate_pdf/$', views.generate_pdf, name='generate_pdf'),
    url(r'^upload_pi_approval/$', views.upload_pi_approval, name='upload_pi_approval'),
]
