from django.contrib.auth.models import User
from django.db import models

from travel.utils import TravelException, EmailNotifier, PassengerDeleteEmailFormatter


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
        if self.is_not_the_same_travel(travel) and self.is_travel_for_the_same_direction(travel, new_travel):
            TravelException.raise_exception('You already have a ride in that direction')

    def is_travel_for_the_same_direction(self, t1, t2):
        return t1.is_return == t2.is_return

    def is_not_the_same_travel(self, travel):
        return self.pk != travel.pk


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

    class NoDriverContactProvidedException(TravelException):
        message = 'Driver contact should be provided to create ride'

    class NotEnoughFreeSeatsException(TravelException):
        message = 'A ride should have place for at least one passenger'

    def get_passengers(self):
        return Passenger.objects.filter(ride=self.pk)

    def get_num_of_free_seats(self):
        return self.num_of_seats - len(self.get_passengers())

    def save(self, *args, **kwargs):
        if self.num_of_seats < 1:
            raise Ride.NotEnoughFreeSeatsException
        self.check_driver_contact_info()
        self.check_available_travels_for_user(travels_of_user=Ride.objects.filter(driver=self.driver), new_travel=self)
        super(Ride, self).save(*args, **kwargs)

    def check_driver_contact_info(self):
        if self.driver.user.last_name == '' \
                or self.driver.user.first_name == '' \
                or self.driver.user.email == '':
            raise Ride.NoDriverContactProvidedException


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
        travels = self.get_rides_of_user()
        self.check_available_travels_for_user(travels_of_user=travels, new_travel=self.ride)
        if len(Ride.objects.filter(driver=self.travel_user)) > 0:
            raise Passenger.DriverCannotBePassengerException
        if self.ride.get_num_of_free_seats() == 0:
            raise Passenger.NoMoreSpaceException
        super(Passenger, self).save(*args, **kwargs)

    def get_rides_of_user(self):
        return Ride.objects.filter(
            pk__in=Passenger.objects.values_list('ride', flat=True).filter(travel_user=self.travel_user))

    # TODO disable url!
    def delete(self, *args, **kwargs):
        super(Passenger, self).delete()
        if self.notify_when_deleted:
            EmailNotifier(to=[self.travel_user.user.email, self.ride.driver.user.email],
                          formatter=PassengerDeleteEmailFormatter(driver=self.ride.driver,
                                                                  passenger=self.travel_user,
                                                                  disable_url='TODO')).notify()

    def get_driver_name(self):
        return self.ride.driver.user.last_name + ' ' + self.ride.driver.user.first_name
