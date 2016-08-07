import time
from datetime import datetime

from django.core.cache import cache
from django.core.mail import send_mail

from travel.models import Notification, Ride
from travel.utils import date_to_naive_str
from travel.notifiers.formatters import PassengerDeleteEmailFormatter, PassengerJoinedEmailFormatter, \
    RideChangedEmailFormatter, RideDeletedEmailFormatter
from wedding import settings


class EmailNotifier:
    CACHE_TIME_ID = 'LAST_NOTIFICATION_TIME'

    def notify(self):
        if self.is_cooldown_finished():
            send_mail(subject=self.formatter.get_title,
                      message=self.formatter.get_message(),
                      from_email='travelmanager@wedding.com',
                      recipient_list=[target.email for target in self.targets],
                      fail_silently=False)
        else:
            Notification.create(self.targets, self.formatter.get_title(), self.formatter.get_message())

    def send_pending_email_notifications(self):
        if not self.is_cooldown_finished():
            return
        notifications = Notification.objects.all()[0:settings.NUM_OF_CONCURRENT_NOTIFICATIONS]
        for notification in notifications:
            send_mail(subject=notification.title,
                      message=notification.message,
                      from_email='travelmanager@wedding.com',
                      recipient_list=[email_dict['email'] for email_dict in notifications[0].targets.values('email')],
                      fail_silently=False)
        Notification.objects.filter(pk__in=[notification.pk for notification in notifications]).delete()

    def is_cooldown_finished(self):
        last_time = cache.get_or_set(self.CACHE_TIME_ID, 0)
        current_time = time.time()
        if last_time + settings.EMAIL_COOLDOWN_SECS < current_time:
            cache.set(self.CACHE_TIME_ID, current_time)
            return True
        return False

    def get_disable_url_for_ride(self, ride):
        template = 'travel/index/#/manage/ride/{}'
        direction = 'back' if ride.is_return else 'there'
        return template.format(direction)

    def get_disble_url_for_passenger(self):
        return 'travel/index/#/rides'

    def get_disable_link(self):
        return settings.APPLICATION_URL + self.get_disable_url()


class PassengerNotifier(EmailNotifier):
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


class RideNotifier(EmailNotifier):
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
