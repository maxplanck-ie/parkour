from django.conf.urls import url
from report import views


urlpatterns = [
    url(r'^$', views.report, name='report'),
]
