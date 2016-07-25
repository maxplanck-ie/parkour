from django.conf.urls import url
from library import views


urlpatterns = [
    url(r'^get_library_protocols/$', views.get_library_protocols, name='get_library_protocols'),
    url(r'^get_library_type/$', views.get_library_type, name='get_library_type'),
    url(r'^get_organisms/$', views.get_organisms, name='get_organisms'),
]
