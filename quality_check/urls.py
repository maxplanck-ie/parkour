from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^update/$', views.update, name='update'),
]
