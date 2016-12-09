from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^get_all/$', views.get_all, name='get_all'),
    url(r'^library_protocols/$', views.get_library_protocols, name='get_library_protocols'),
    url(r'^library_type/$', views.get_library_type, name='get_library_type'),
    url(r'^save/$', views.save_library, name='save_library'),
    url(r'^delete/$', views.delete_library, name='delete_library'),
]
