from django.conf.urls import url
from request import views


urlpatterns = [
    url(r'^get_requests/$', views.get_requests, name='get_requests'),
]
