from datetime import datetime

from django.contrib.auth.models import User
from django.db import models

from travel.utils import TravelException, EmailNotifier, PassengerDeleteEmailFormatter, RideChangedEmailFormatter, \
    date_to_naive_str, PassengerJoinedEmailFormatter


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

    def get_passengers(self):
        return Passenger.objects.filter(ride=self.pk)

    def get_num_of_free_seats(self):
        return self.num_of_seats - len(self.get_passengers())

    def save(self, *args, **kwargs):
        if self.num_of_seats < 1:
            raise Ride.NotEnoughFreeSeatsException
        self.check_driver_contact_info()
        self.check_available_travels_for_user(travels_of_user=Ride.objects.filter(driver=self.driver), new_travel=self)
        self.update_old_instance_reference()
        super(Ride, self).save(*args, **kwargs)
        self.notify_passengers_on_change()

    def check_driver_contact_info(self):
        if self.driver.user.last_name == '' \
                or self.driver.user.first_name == '' \
                or self.driver.user.email == '':
            raise Ride.NoDriverContactProvidedException

    # TODO
    def notify_passengers_on_change(self):
        changes = self.get_model_changes()
        if len(changes) == 0:
            return
        passenger_emails = self.get_passenger_emails()
        if len(passenger_emails) > 0:
            EmailNotifier(to=passenger_emails,
                          formatter=RideChangedEmailFormatter(ride=self,
                                                              changes=changes,
                                                              disable_url='TODO')).notify()

    def get_passenger_emails(self):
        passenger_emails = []
        for passenger in self.get_passengers().filter(notify_when_ride_changes=True):
            passenger_emails.append(passenger.travel_user.user.email)
        return passenger_emails

    def get_model_changes(self):
        changes = []
        if self.old_instance is None:
            return changes
        for field in Ride.get_fields():
            field_name = field.name
            self.collect_changes(changes, field_name)
        return changes

    def update_old_instance_reference(self):
        if self.pk is None:
            return
        self.old_instance = Ride.objects.get(pk=self.pk)

    @staticmethod
    def get_fields():
        return Ride._meta.get_fields()

    def collect_changes(self, changes, field_name):
        old_val, new_val = self.__get_old_and_new_values(field_name)
        if new_val != old_val:
            changes.append(Ride.get_diff_dict(field_name, old_val, new_val))

    @staticmethod
    def get_diff_dict(key, old, new):
        return {key: {'old': old, 'new': new}}

    def __get_old_and_new_values(self, field_name):
        new_val = self.convert_value_to_str(getattr(self, field_name))
        old_val = self.convert_value_to_str(getattr(self.old_instance, field_name))
        return old_val, new_val

    def convert_value_to_str(self, val):
        if isinstance(val, datetime):
            return date_to_naive_str(val)
        return str(val)


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
        self.check_available_travels_for_user(travels_of_user=self.get_rides_of_user(), new_travel=self.ride)
        if len(Ride.objects.filter(driver=self.travel_user)) > 0:
            raise Passenger.DriverCannotBePassengerException
        if self.ride.get_num_of_free_seats() == 0:
            raise Passenger.NoMoreSpaceException
        is_new_instance = self.is_a_new_instance()
        super(Passenger, self).save(*args, **kwargs)
        self.notify_driver_on_creation(is_new_instance)

    def get_rides_of_user(self):
        rides_of_user_in_both_direction = Passenger.objects.values_list('ride', flat=True).filter(
            travel_user=self.travel_user)
        return Ride.objects.filter(pk__in=rides_of_user_in_both_direction)

    def notify_driver_on_creation(self, is_new_instance):
        if is_new_instance and self.ride.notify_when_passenger_joins:
            EmailNotifier(to=[self.ride.driver.user.email],
                          formatter=PassengerJoinedEmailFormatter(passenger=self,
                                                                  disable_url='TODO')).notify()

    # TODO disable url!
    def delete(self, *args, **kwargs):
        super(Passenger, self).delete()
        if self.notify_when_deleted:
            EmailNotifier(to=[self.travel_user.user.email, self.ride.driver.user.email],
                          formatter=PassengerDeleteEmailFormatter(passenger=self,
                                                                  disable_url='TODO')).notify()
