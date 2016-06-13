from django.conf.urls import url
from request import views


urlpatterns = [
    url(r'^get_requests/$', views.get_requests, name='get_requests'),
    url(r'^add_request/$', views.add_request, name='add_request'),
    url(r'^edit_request/$', views.edit_request, name='edit_request'),
]
