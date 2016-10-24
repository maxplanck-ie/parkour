from django.conf.urls import url
from pooling import views


urlpatterns = [
    url(r'^get_pooling_tree/$', views.get_pooling_tree, name='get_pooling_tree'),
]
