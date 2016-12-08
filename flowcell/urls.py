from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^sequencer_list/$', views.sequencer_list, name='sequencer_list'),
    url(r'^pool_list/$', views.pool_list, name='pool_list'),
    url(r'^pool_info/$', views.pool_info, name='pool_info'),
]
