from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^get_all/$', views.get_all, name='library.get_all'),
    url(r'^save/$', views.save_library, name='save_library'),
    url(r'^delete/$', views.delete_library, name='delete_library'),
]
