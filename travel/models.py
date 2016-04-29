from django.contrib.auth.models import User
from django.db import models
from django.db.utils import IntegrityError


class TravelException(Exception):
    pass


class TravelUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    accepted_eula = models.BooleanField(default=False, verbose_name='Elfogadta az eulat')


class Ride(models.Model):
    driver = models.OneToOneField(TravelUser, on_delete=models.CASCADE)
    price = models.IntegerField(verbose_name='Ar')
    num_of_seats = models.IntegerField(verbose_name='Ferohelyek szama(soforules nelkul)')
    start_time = models.DateTimeField(verbose_name='Indulasi ido')
    start_location = models.CharField(max_length=100, verbose_name='Indulasi hely')
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
        self.__try_save(*args, **kwargs)

    def __try_save(self, *args, **kwargs):
        try:
            super(Ride, self).save(*args, **kwargs)
        except IntegrityError:
            e = TravelException()
            e.message = 'You can only drive one ride a travel'
            raise e

    def check_driver_contact_info(self):
        if self.driver.user.last_name == '' \
                or self.driver.user.first_name == '' \
                or self.driver.user.email == '':
            raise Ride.NoDriverContactProvidedException


class Passenger(models.Model):
    travel_user = models.OneToOneField(TravelUser, on_delete=models.CASCADE)
    ride = models.ForeignKey(Ride, related_name='ride', verbose_name='Fuvar')
    notify_when_ride_changes = models.BooleanField(default=False, verbose_name='Ertesites fuvar valtozaskor')
    notify_when_ride_is_deleted = models.BooleanField(default=False, verbose_name='Ertesites fuvar torlodeskor')
    notify_when_thrown_out_of_ride = models.BooleanField(default=False,
                                                         verbose_name='Ertesites fuvarbol valo kidobaskor')

    class NoMoreSpaceException(TravelException):
        message = 'There is no more free space available in the selected ride'

    class DriverCannotBePassengerException(TravelException):
        message = 'You are already a driver'

    def save(self, *args, **kwargs):
        if len(Ride.objects.filter(driver=self.travel_user)) > 0:
            raise Passenger.DriverCannotBePassengerException
        if self.ride.get_num_of_free_seats() == 0:
            raise Passenger.NoMoreSpaceException
        self.__try_save(*args, **kwargs)

    def __try_save(self, *args, **kwargs):
        try:
            super(Passenger, self).save(*args, **kwargs)
        except IntegrityError:
            e = TravelException()
            e.message = 'You can only travel in one ride a travel'
            raise e
