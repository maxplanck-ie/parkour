from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^get_all/$', views.get_all, name='get_all'),
    url(r'^update/$', views.update, name='update'),
    url(r'^update_all/$', views.update_all, name='update_all'),

    url(r'^download_benchtop_protocol/$', views.download_benchtop_protocol, name='download_benchtop_protocol'),
    url(r'^upload_benchtop_protocol/$', views.upload_benchtop_protocol, name='upload_benchtop_protocol'),
]
