from django.conf.urls import include, url
from django.contrib import admin
from rest_framework import routers
from travel.rest import rest as travel_rest

router = routers.DefaultRouter()
travel_rest.register(router)

prefix = 'rest/'
urlpatterns = [
    url(r'^' + prefix, include(router.urls)),
    url(r'^' + prefix + 'login/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls))
]
