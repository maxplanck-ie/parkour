from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^get_all/$', views.get_all, name='library_preparation.get_all'),
    url(r'^update/$', views.update, name='library_preparation.update'),
    url(r'^update_all/$', views.update_all, name='library_preparation.update_all'),
    url(r'^qc_update_all/$', views.qc_update_all, name='library_preparation.qc_update_all'),

    url(r'^download_benchtop_protocol/$', views.download_benchtop_protocol, name='download_benchtop_protocol'),
]
