from django.conf.urls import url
from researcher import views


urlpatterns = [
    url(r'^get_researchers/$', views.get_researchers, name='get_researchers'),
    url(r'^add_researcher_field/$', views.add_researcher_field, name='add_researcher_field'),
    
    url(r'^save_researcher/$', views.save_researcher, name='save_researcher'),
    url(r'^delete_researcher/$', views.delete_researcher, name='delete_researcher'),

    url(r'^get_organizations/$', views.get_organizations, name='get_organizations'),
    url(r'^get_pis/$', views.get_pis, name='get_pis'),
    url(r'^get_cost_units/$', views.get_cost_units, name='get_cost_units'),
]
