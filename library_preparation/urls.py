from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^get_all/$', views.get_all, name='get_all'),
    url(r'^edit/$', views.edit, name='edit'),
    url(r'^download_benchtop_protocol/$', views.download_benchtop_protocol, name='download_benchtop_protocol'),
    url(r'^upload_benchtop_protocol/$', views.upload_benchtop_protocol, name='upload_benchtop_protocol'),
]
