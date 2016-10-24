from django.conf.urls import url
from qualitycheck import views


urlpatterns = [
    url(r'^qc_incoming_libraries/$', views.qc_incoming_libraries, name='qc_incoming_libraries'),
]
