from django.conf.urls import url
from request import views


urlpatterns = [
    url(r'^upload_files/$', views.upload_files, name='upload_files'),
]
