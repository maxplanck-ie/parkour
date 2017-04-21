from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^update/$', views.update, name='update'),
    url(r'^update_all/$', views.update_all, name='update_all'),
]
