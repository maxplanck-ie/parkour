from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^get_all/$', views.get_all, name='library.get_all'),
    url(r'^save/$', views.save_library, name='save_library'),
    url(r'^delete/$', views.delete_library, name='delete_library'),
    url(r'^upload_files/$', views.upload_files, name='upload_files'),
    url(r'^get_files/$', views.get_files, name='get_files'),
]
