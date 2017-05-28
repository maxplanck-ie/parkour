from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^update/$', views.update, name='quality_check.update'),
    url(r'^update_all/$', views.update_all, name='quality_check.update_all'),
    url(r'^qc_update_all/$', views.qc_update_all, name='quality_check.qc_update_all'),
]
