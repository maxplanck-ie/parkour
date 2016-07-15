from django.conf.urls import url
from django.contrib.auth import views as auth_views
from common import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^login/$', auth_views.login, {'template_name': 'login.html'}),
    url(r'^logout/$', auth_views.logout, {'next_page': '/'}),
    url(r'^get_username/$', views.get_username, name='get_username'),
]
