from datetime import datetime

from django.db.models.signals import post_save, post_delete, pre_delete
from django.dispatch import receiver

from travel.models import Passenger, Ride, Notification
from travel.utils import PassengerJoinedEmailFormatter, RideChangedEmailFormatter, date_to_naive_str, \
    PassengerDeleteEmailFormatter, RideDeletedEmailFormatter


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
        RideChangeNotifier(ride=instance).notify()


@receiver(pre_delete, sender=Ride)
def receive_ride_pre_delete(instance, **kwargs):
    RideDeletedNotifier(ride=instance).notify()


class Notifier:
    # TODO move to app.py
    HOST_URL = 'http://agiadam-staging.herokuapp.com/'

    def __init__(self):
        self.formatter = None
        self.targets = None

    def notify(self):
        Notification.create(self.targets, self.formatter.get_title(), self.formatter.get_message())

    def get_disable_url(self):
        raise NotImplementedError

    def get_disable_url_for_ride(self, ride):
        template = 'travel/index/#/manage/ride/{}'
        direction = 'back' if ride.is_return else 'there'
        return template.format(direction)

    def get_disble_url_for_passenger(self):
        return 'travel/index/#/rides'

    def get_disable_link(self):
        return self.HOST_URL + self.get_disable_url()


class PassengerNotifier(Notifier):
    def __init__(self, passenger):
        self.passenger = passenger

    def notify(self):
        super(PassengerNotifier, self).notify()

    def get_disable_url(self):
        raise NotImplementedError


class PassengerJoinedNotifier(PassengerNotifier):
    def notify(self):
        if self.passenger.ride.notify_when_passenger_joins:
            self.formatter = PassengerJoinedEmailFormatter(passenger=self.passenger,
                                                           disable_url=self.get_disable_link())
            self.targets = [self.passenger.ride.driver.user]
            super(PassengerJoinedNotifier, self).notify()

    def get_disable_url(self):
        return self.get_disable_url_for_ride(self.passenger.ride)


class PassengerDeletedNotifier(PassengerNotifier):
    def notify(self):
        if self.passenger.notify_when_deleted:
            self.formatter = PassengerDeleteEmailFormatter(passenger=self.passenger,
                                                           disable_url=self.get_disable_link())
            self.targets = [self.passenger.travel_user.user]
            super(PassengerDeletedNotifier, self).notify()

    def get_disable_url(self):
        return self.get_disble_url_for_passenger()


class RideNotifier(Notifier):
    def __init__(self, ride):
        self.ride = ride
        self.targets = self.get_targets()

    def notify(self):
        super(RideNotifier, self).notify()

    def get_targets(self):
        passengers = self.ride.get_passengers()
        passengers = self.filter_passengers_by_email_flags(passengers)
        return [passenger.travel_user.user for passenger in passengers]

    def filter_passengers_by_email_flags(self, passengers):
        raise NotImplementedError

    def get_disable_url(self):
        return self.get_disble_url_for_passenger()


class RideChangeNotifier(RideNotifier):
    def notify(self):
        changes = self.get_model_changes()
        if len(changes) == 0:
            return
        if len(self.targets) > 0:
            self.formatter = RideChangedEmailFormatter(ride=self.ride,
                                                       changes=changes,
                                                       disable_url=self.get_disable_link())
            super(RideChangeNotifier, self).notify()

    def filter_passengers_by_email_flags(self, passengers):
        return passengers.filter(notify_when_ride_changes=True)

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


class RideDeletedNotifier(RideNotifier):
    def notify(self):
        if len(self.targets) > 0:
            self.formatter = RideDeletedEmailFormatter(ride=self.ride,
                                                       disable_url=self.get_disable_link())
            super(RideDeletedNotifier, self).notify()

    def filter_passengers_by_email_flags(self, passengers):
        return passengers.filter(notify_when_ride_is_deleted=True)
