import re

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework import viewsets
from rest_framework import permissions

from wedding import settings


class UserPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        return self._is_object_level_request(request.path) or request.user.is_superuser

    def _is_object_level_request(self, path):
        return re.match('/' +
                        settings.REST_BASE_PATH +
                        settings.REST_VERSION +
                        UserViewSet.base_path +
                        '/[0-9]+/', path) is not None

    def has_object_permission(self, request, view, obj):
        return request.user == obj or request.user.is_superuser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['pk', 'username', 'first_name', 'last_name', 'email']


class UserViewSet(viewsets.ModelViewSet):
    base_path = 'users'
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserPermissions]


def register(router):
    router.register(UserViewSet.base_path, UserViewSet)
