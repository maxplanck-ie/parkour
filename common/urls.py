from django.conf.urls import url
from django.contrib.auth import views as auth_views
from common import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^login/$', auth_views.login, {'template_name': 'login.html'}, name='login'),
    url(r'^logout/$', auth_views.logout, {'next_page': '/'}, name='logout'),
    url(r'^get_navigation_tree/$', views.get_navigation_tree, name='get_navigation_tree'),

    url(r'^accounts/password/reset/$', auth_views.password_reset, {'post_reset_redirect' : '/accounts/password/reset/done/'}),
    url(r'^accounts/password/reset/done/$', auth_views.password_reset_done),
    url(r'^accounts/password/reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$', auth_views.password_reset_confirm, {'post_reset_redirect' : '/accounts/password/done/'}),
    url(r'^accounts/password/done/$', auth_views.password_reset_complete),
]
