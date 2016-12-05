from django.conf.urls import url
from flowcell import views


urlpatterns = [
    url(r'^get_sequencers/$', views.get_sequencers, name='get_sequencers'),
    url(r'^get_pools/$', views.get_pools, name='get_pools'),
]
