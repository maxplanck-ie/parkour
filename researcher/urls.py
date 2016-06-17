from django.conf.urls import url
from researcher import views


urlpatterns = [
    url(r'^get_researchers/$', views.get_researchers, name='get_researchers'),
    url(r'^add_researcher/$', views.add_researcher, name='add_researcher'),
    url(r'^edit_researcher/$', views.edit_researcher, name='edit_researcher'),
    url(r'^delete_researcher/$', views.delete_researcher, name='delete_researcher'),

    url(r'^get_pis/$', views.get_pis, name='get_pis'),
    url(r'^get_organizations/$', views.get_organizations, name='get_organizations'),
]
