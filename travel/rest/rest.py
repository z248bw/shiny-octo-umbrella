import re

from django.contrib.auth import logout, login
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import detail_route, list_route
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import exception_handler, APIView
from rest_framework import status
from rest_framework.viewsets import ViewSet

from travel.models import Ride, TravelUser, Passenger, TravelException
from wedding import settings


def custom_exception_handler(exc, context):
    if isinstance(exc, TravelException):
        r = Response(TravelExceptionSerializer(exc).data)
        r.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return r

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


class UserPermissions(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        super(UserPermissions, self).has_permission(request, view)
        return super(UserPermissions, self).has_permission(request, view) and \
               is_object_level_request(viewset_base_path=UserViewSet.base_path, request_path=request.path) or \
               request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        return super(UserPermissions, self).has_object_permission(request, view, obj) and \
        request.user == obj or request.user.is_superuser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['pk', 'username', 'first_name', 'last_name', 'email']


class UserViewSet(viewsets.ModelViewSet):
    base_path = 'users'
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserPermissions]

    @detail_route(methods=['post'])
    def logout(self, request, pk):
        logout(request)
        return Response()


class TravelUserPermissions(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        if not super(TravelUserPermissions, self).has_object_permission(request, view, obj):
            return False
        if request.method == 'PUT':
            return request.user == obj.user or request.user.is_superuser
        if request.method in permissions.SAFE_METHODS:
            return True
        return False


class TravelUserSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    phone = serializers.CharField(max_length=20)

    class Meta:
        model = TravelUser
        fields = ['pk', 'user', 'phone', 'accepted_eula']


class TravelUserViewSet(viewsets.ModelViewSet):
    base_path = 'travel_users'
    queryset = TravelUser.objects.all()
    serializer_class = TravelUserSerializer
    permission_classes = [TravelUserPermissions]

    def perform_create(self, serializer):
        user = User.objects.get(pk=self.request.user.pk)
        serializer.save(user=user)

    @list_route(methods=['get'])
    def me(self, request):
        me = TravelUser.objects.get(user=request.user)
        driven_rides = self.get_driven_rides(me)
        passenger_of_rides = self.get_my_passenger_objects(me)
        response = {'travel_user': TravelUserSerializer(me).data,
                    'driven_rides': driven_rides,
                    'passenger_of_rides': passenger_of_rides}
        return Response(response)

    def get_my_passenger_objects(self, me):
        passengers = PassengerSerializer(Passenger.objects.filter(travel_user=me), many=True).data
        for passenger in passengers:
            passenger['ride'] = RideSerializer(Ride.objects.get(pk=passenger['ride'])).data
        return passengers

    def get_driven_rides(self, me):
        return RideSerializer(Ride.objects.filter(driver=me), many=True).data


class RegistrationUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=20)
    password = serializers.CharField(max_length=20)
    first_name = serializers.CharField(max_length=20)
    last_name = serializers.CharField(max_length=20)
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ['pk', 'username', 'password', 'first_name', 'last_name', 'email']


class RegistrationPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        if 'passphrase' in request.data and request.data['passphrase'] == settings.REGISTRATION_PASSPHRASE:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        return False


class RegistrationViewSet(ViewSet):
    base_path = 'register'
    permission_classes = [RegistrationPermissions]

    @list_route(methods=['post'])
    def travel_user(self, request):
        user = self.__create_user(request.data['user'])
        travel_user = self.__create_travel_user(request.data, user)
        serializer = TravelUserSerializer(travel_user)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    def __create_user(self, data):
        user_deserializer = RegistrationUserSerializer(data=data)
        user_deserializer.is_valid(raise_exception=True)
        return User.objects.create_user(username=user_deserializer.validated_data['username'],
                                        password=user_deserializer.validated_data['password'],
                                        email=user_deserializer.validated_data['email'],
                                        first_name=user_deserializer.validated_data['first_name'],
                                        last_name=user_deserializer.validated_data['last_name'])
        # return user_deserializer.save()

    def __create_travel_user(self, data, user):
        travel_user_deserializer = TravelUserSerializer(data=data)
        travel_user_deserializer.is_valid(raise_exception=True)
        return travel_user_deserializer.save(user=user)


class RidePermissions(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return super(RidePermissions, self).has_object_permission(request, view, obj) and \
               request.method in permissions.SAFE_METHODS or \
               request.user == obj.driver.user or \
               request.user.is_superuser


class RideSerializer(serializers.ModelSerializer):
    driver = TravelUserSerializer(read_only=True)
    num_of_free_seats = serializers.SerializerMethodField()

    def get_num_of_free_seats(self, ride):
        return ride.get_num_of_free_seats()

    class Meta:
        model = Ride
        fields = ['pk', 'driver', 'price', 'num_of_seats', 'start_time', 'num_of_free_seats',
                  'start_location', 'is_return', 'car_name', 'description', 'notify_when_passenger_joins']


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


class PassengerPermissions(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        if not super(PassengerPermissions, self).has_object_permission(request, view, obj):
            return False

        if request.method == 'DELETE' and request.user == obj.ride.driver.user:
            return True
        return request.user == obj.travel_user.user or request.user.is_superuser


class PassengerSerializer(serializers.ModelSerializer):
    travel_user = TravelUserSerializer(read_only=True)

    class Meta:
        model = Passenger
        fields = ['pk',
                  'travel_user',
                  'ride',
                  'notify_when_ride_changes',
                  'notify_when_ride_is_deleted',
                  'notify_when_deleted']


class PassengerViewSet(viewsets.ModelViewSet):
    base_path = 'passengers'
    queryset = Passenger.objects.all()
    serializer_class = PassengerSerializer
    permission_classes = [PassengerPermissions]

    def perform_create(self, serializer):
        user = TravelUser.objects.get(user=self.request.user.pk)
        serializer.save(travel_user=user)


def register(router):
    router.register(RegistrationViewSet.base_path, RegistrationViewSet, base_name='register')
    router.register(UserViewSet.base_path, UserViewSet)
    router.register(TravelUserViewSet.base_path, TravelUserViewSet)
    router.register(RideViewSet.base_path, RideViewSet)
    router.register(PassengerViewSet.base_path, PassengerViewSet)
