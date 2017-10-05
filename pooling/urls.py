from django.conf.urls import url
from pooling import views


urlpatterns = [
    url(r'^download_benchtop_protocol/$', views.download_benchtop_protocol, name='download_benchtop_protocol'),
    url(r'^download_pooling_template/$', views.download_pooling_template, name='download_pooling_template'),
]
