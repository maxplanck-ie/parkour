from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^update/$', views.update, name='incoming_libraries.update'),
    url(r'^update_all/$', views.update_all, name='incoming_libraries.update_all'),
    url(r'^qc_update_all/$', views.qc_update_all, name='incoming_libraries.qc_update_all'),
]
