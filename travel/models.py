from django.contrib.auth.models import User
from django.db import models

import travel
from travel.utils import TravelException


class TravelUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    accepted_eula = models.BooleanField(default=False, verbose_name='Elfogadta az eulat')


class AbstractTravelModel(models.Model):
    class Meta:
        abstract = True

    def check_available_travels_for_user(self, travels_of_user, new_travel):
        if len(travels_of_user) == 0:
            return
        if len(travels_of_user) > 1:
            TravelException.raise_exception('You already have a ride there and back')
        travel = travels_of_user[0]
        if self.is_a_new_instance() and self.is_travel_for_the_same_direction(travel, new_travel):
            TravelException.raise_exception('You already have a ride in that direction')

    def is_travel_for_the_same_direction(self, t1, t2):
        return t1.is_return == t2.is_return

    def is_a_new_instance(self):
        return self.pk is None


class Ride(AbstractTravelModel):
    driver = models.ForeignKey(TravelUser, related_name='driver', verbose_name='Sofor')
    price = models.IntegerField(verbose_name='Ar')
    num_of_seats = models.IntegerField(verbose_name='Ferohelyek szama(soforules nelkul)')
    start_time = models.DateTimeField(verbose_name='Indulasi ido')
    start_location = models.CharField(max_length=100, verbose_name='Indulasi hely')
    is_return = models.BooleanField(default=False)
    notify_when_passenger_joins = models.BooleanField(default=False, verbose_name='Ertesites utas csatlakozaskor')
    car_name = models.CharField(max_length=20, verbose_name='Auto tipusa', null=True, blank=True)
    description = models.TextField(max_length=200, verbose_name='Egyeb', null=True, blank=True)

    def __init__(self, *args, **kwargs):
        super(Ride, self).__init__(*args, **kwargs)
        self.old_instance = None

    class NoDriverContactProvidedException(TravelException):
        message = 'Driver contact should be provided to create ride'

    class NotEnoughFreeSeatsException(TravelException):
        message = 'A ride should have place for at least one passenger'

    class NotEnoughSeatsException(TravelException):
        message = 'A ride should have at least as many seats as passengers'

    def get_passengers(self):
        return Passenger.objects.filter(ride=self.pk)

    def get_num_of_free_seats(self):
        return self.num_of_seats - len(self.get_passengers())

    def save(self, *args, **kwargs):
        self.check_number_of_seats()
        self.check_driver_contact_info()
        self.check_available_travels_for_user(travels_of_user=Ride.objects.filter(driver=self.driver), new_travel=self)
        self.update_old_instance_reference()
        super(Ride, self).save(*args, **kwargs)

    def check_number_of_seats(self):
        if self.num_of_seats < 1:
            raise Ride.NotEnoughFreeSeatsException
        if self.num_of_seats < len(self.get_passengers()):
            raise Ride.NotEnoughSeatsException

    def check_driver_contact_info(self):
        if self.driver.user.last_name == '' \
                or self.driver.user.first_name == '' \
                or self.driver.user.email == '':
            raise Ride.NoDriverContactProvidedException

    def update_old_instance_reference(self):
        if self.pk is None:
            return
        self.old_instance = Ride.objects.get(pk=self.pk)

    @staticmethod
    def get_fields():
        return Ride._meta.get_fields()


class Passenger(AbstractTravelModel):
    travel_user = models.ForeignKey(TravelUser, related_name='travel_user', verbose_name='Felhasznalo')
    ride = models.ForeignKey(Ride, related_name='ride', verbose_name='Fuvar')
    notify_when_ride_changes = models.BooleanField(default=False, verbose_name='Ertesites fuvar valtozaskor')
    notify_when_ride_is_deleted = models.BooleanField(default=False, verbose_name='Ertesites fuvar torlodeskor')
    notify_when_deleted = models.BooleanField(default=False, verbose_name='Ertesites fuvarbol valo kidobaskor')

    class NoMoreSpaceException(TravelException):
        message = 'There is no more free space available in the selected ride'

    class DriverCannotBePassengerException(TravelException):
        message = 'You are already a driver'

    def save(self, *args, **kwargs):
        if self.is_already_a_driver_in_that_direction():
            raise Passenger.DriverCannotBePassengerException
        if self.no_more_free_seats_in_ride():
            raise Passenger.NoMoreSpaceException
        self.check_available_travels_for_user(travels_of_user=self.get_rides_of_user(), new_travel=self.ride)
        super(Passenger, self).save(*args, **kwargs)

    def is_already_a_driver_in_that_direction(self):
        rides = Ride.objects.filter(driver=self.travel_user)
        for ride in rides:
            is_already_a_driver_in_direction = ride.is_return == self.ride.is_return
            if is_already_a_driver_in_direction:
                return True
        return False

    def no_more_free_seats_in_ride(self):
        return self.pk is None and self.ride.get_num_of_free_seats() == 0

    def get_rides_of_user(self):
        rides_of_user_in_both_direction = Passenger.objects.values_list('ride', flat=True).filter(
            travel_user=self.travel_user)
        return Ride.objects.filter(pk__in=rides_of_user_in_both_direction)
