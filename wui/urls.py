"""wui URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin

urlpatterns = [
    url(r'^admin/', admin.site.urls),

    url(r'', include('common.urls')),
    url(r'', include('researcher.urls')),
    url(r'', include('request.urls')),
]

from django.views.defaults import page_not_found, server_error
from wui import settings
if settings.DEBUG:
    urlpatterns += [
        url(r'^404/$', page_not_found, kwargs={'exception': Exception("Page not Found")}),
        url(r'^500/$', server_error),
    ]
