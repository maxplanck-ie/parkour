from django.conf.urls import url
from pooling import views


urlpatterns = [
    url(r'^get_all/$', views.get_all, name='pooling.get_all'),
    url(r'^edit/$', views.edit, name='edit'),
    url(r'^download_pooling_template/$', views.download_pooling_template, name='download_pooling_template'),
    url(r'^upload_pooling_template/$', views.upload_pooling_template, name='upload_pooling_template'),
]
