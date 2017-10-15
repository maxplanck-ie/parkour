from django.conf.urls import url
from request import views


urlpatterns = [
    url(r'^get_files/$', views.get_files, name='get_files'),
    url(r'^upload_files/$', views.upload_files, name='upload_files'),
]
