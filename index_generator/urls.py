from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^save_pool/$', views.save_pool, name='save_pool'),
    # url(r'^reset/$', views.reset, name='reset'),
]
