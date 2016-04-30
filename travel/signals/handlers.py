from datetime import datetime

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from travel.models import Passenger, Ride
from travel.utils import EmailNotifier, PassengerJoinedEmailFormatter, RideChangedEmailFormatter, date_to_naive_str, \
    PassengerDeleteEmailFormatter


@receiver(post_save, sender=Passenger)
def receive_passenger_post_save(instance, created, **kwargs):
    if created:
        PassengerJoinedNotifier(passenger=instance).notify()


@receiver(post_delete, sender=Passenger)
def receive_passenger_post_delete(instance, **kwargs):
    PassengerDeletedNotifier(passenger=instance).notify()


@receiver(post_save, sender=Ride)
def receive_ride_post_save(instance, created, **kwargs):
    if not created:
        RideChangeNotifier(ride=instance).notify_passengers_on_change()


class PassengerNotifier:
    def __init__(self, passenger):
        self.passenger = passenger


# TODO: disable url
class PassengerJoinedNotifier(PassengerNotifier):
    def notify(self):
        if self.passenger.ride.notify_when_passenger_joins:
            EmailNotifier(to=[self.passenger.ride.driver.user.email],
                          formatter=PassengerJoinedEmailFormatter(passenger=self.passenger,
                                                                  disable_url='TODO')).notify()


# TODO: disable url
class PassengerDeletedNotifier(PassengerNotifier):
    def notify(self):
        if self.passenger.notify_when_deleted:
            EmailNotifier(to=[self.passenger.travel_user.user.email, self.passenger.ride.driver.user.email],
                          formatter=PassengerDeleteEmailFormatter(passenger=self.passenger,
                                                                  disable_url='TODO')).notify()


class RideChangeNotifier:
    def __init__(self, ride):
        self.ride = ride

    # TODO disable url
    def notify_passengers_on_change(self):
        changes = self.get_model_changes()
        if len(changes) == 0:
            return
        passenger_emails = self.get_passenger_emails()
        if len(passenger_emails) > 0:
            EmailNotifier(to=passenger_emails,
                          formatter=RideChangedEmailFormatter(ride=self.ride,
                                                              changes=changes,
                                                              disable_url='TODO')).notify()

    def get_passenger_emails(self):
        passenger_emails = []
        for passenger in self.ride.get_passengers().filter(notify_when_ride_changes=True):
            passenger_emails.append(passenger.travel_user.user.email)
        return passenger_emails

    def get_model_changes(self):
        changes = []
        if self.ride.old_instance is None:
            return changes
        for field in Ride.get_fields():
            field_name = field.name
            self.collect_changes(changes, field_name)
        return changes

    def update_old_instance_reference(self):
        if self.ride.pk is None:
            return
        self.ride.old_instance = Ride.objects.get(pk=self.ride.pk)

    def collect_changes(self, changes, field_name):
        old_val, new_val = self.__get_old_and_new_values(field_name)
        if new_val != old_val:
            changes.append(RideChangeNotifier.get_diff_dict(field_name, old_val, new_val))

    @staticmethod
    def get_diff_dict(key, old, new):
        return {key: {'old': old, 'new': new}}

    def __get_old_and_new_values(self, field_name):
        new_val = self.convert_value_to_str(getattr(self.ride, field_name))
        old_val = self.convert_value_to_str(getattr(self.ride.old_instance, field_name))
        return old_val, new_val

    def convert_value_to_str(self, val):
        if isinstance(val, datetime):
            return date_to_naive_str(val)
        return str(val)
