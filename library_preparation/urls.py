from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^download_benchtop_protocol/$', views.download_benchtop_protocol, name='download_benchtop_protocol'),
]
