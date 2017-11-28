from django.conf.urls import url
from invoice import views


urlpatterns = [
    url(r'^$', views.invoice, name='invoice'),
]
