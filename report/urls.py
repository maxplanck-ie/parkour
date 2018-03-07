from django.conf.urls import url
from report import views


urlpatterns = [
    url(r'^report/$', views.report, name='report'),
    url(r'^db/$', views.database, name='database'),
]
