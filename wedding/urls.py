import django
from django.conf.urls import include, url
from django.contrib import admin
from rest_framework import routers

from travel import views
from travel.rest import rest as travel_rest
from wedding import settings

router = routers.DefaultRouter()
travel_rest.register(router)

prefix = settings.REST_BASE_PATH + settings.REST_VERSION
urlpatterns = [
    url(r'^' + prefix, include(router.urls)),
    url(r'^' + prefix + 'login/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/login/$', django.contrib.auth.views.login, name='login'),
    url(r'^travel/index/$', views.index, name='index'),
    url(r'^travel/register/$', views.register, name='register'),
]
