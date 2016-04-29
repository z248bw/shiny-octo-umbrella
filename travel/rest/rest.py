import re

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import detail_route
from rest_framework.response import Response
from rest_framework.views import exception_handler

from travel.models import Ride, TravelUser, Passenger, TravelException
from wedding import settings


def custom_exception_handler(exc, context):
    if isinstance(exc, TravelException):
        return Response(TravelExceptionSerializer(exc).data)

    # Call REST framework's default exception handler,
    # to get the standard error response.
    response = exception_handler(exc, context)

    return response


class TravelExceptionSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=40)


def is_object_level_request(viewset_base_path, request_path):
    return re.match('/' +
                    settings.REST_BASE_PATH +
                    settings.REST_VERSION +
                    viewset_base_path +
                    '/[0-9]+/', request_path) is not None


class UserPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_object_level_request(viewset_base_path=UserViewSet.base_path,
                                       request_path=request.path) or request.user.is_superuser

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


class TravelUserSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = TravelUser
        fields = ['pk', 'user', 'phone']


class RidePermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        return request.user == obj.driver.user or request.user.is_superuser


class RideSerializer(serializers.ModelSerializer):
    driver = TravelUserSerializer(read_only=True)
    num_of_free_seats = serializers.SerializerMethodField()

    def get_num_of_free_seats(self, ride):
        return ride.get_num_of_free_seats()

    class Meta:
        model = Ride
        fields = ['pk', 'driver', 'price', 'num_of_seats', 'start_time', 'num_of_free_seats',
                  'start_location', 'car_name', 'description']


class RideViewSet(viewsets.ModelViewSet):
    base_path = 'rides'
    queryset = Ride.objects.all()
    serializer_class = RideSerializer
    permission_classes = [RidePermissions]

    def perform_create(self, serializer):
        driver = TravelUser.objects.get(user=self.request.user.pk)
        serializer.save(driver=driver)

    @detail_route(methods=['get'])
    def passengers(self, request, pk=None):
        passengers = Ride.objects.get(pk=pk).get_passengers()
        return Response(PassengerSerializer(passengers, many=True).data)


class PassengerPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE' and request.user == obj.ride.driver.user:
            return True
        return request.user == obj.travel_user.user or request.user.is_superuser


class PassengerSerializer(serializers.ModelSerializer):
    travel_user = TravelUserSerializer(read_only=True)

    class Meta:
        model = Passenger
        fields = ['pk', 'travel_user', 'ride']


class PassengerViewSet(viewsets.ModelViewSet):
    base_path = 'passengers'
    queryset = Passenger.objects.all()
    serializer_class = PassengerSerializer
    permission_classes = [PassengerPermissions]

    def perform_create(self, serializer):
        user = TravelUser.objects.get(user=self.request.user.pk)
        serializer.save(travel_user=user)


def register(router):
    router.register(UserViewSet.base_path, UserViewSet)
    router.register(RideViewSet.base_path, RideViewSet)
    router.register(PassengerViewSet.base_path, PassengerViewSet)
