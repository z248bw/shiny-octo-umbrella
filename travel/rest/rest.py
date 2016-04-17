from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework import viewsets


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['pk', 'username', 'first_name', 'last_name', 'email']


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


def register(router):
    router.register(r'users', UserViewSet)
