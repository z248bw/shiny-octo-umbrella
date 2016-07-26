import time
from django.core.cache import cache
from django.core.mail import send_mail
from django.utils.translation import ugettext as _

from wedding import settings


def date_to_naive_str(date):
    return date.replace(tzinfo=None).isoformat()


class TravelException(Exception):
    @staticmethod
    def raise_exception(message):
        e = TravelException()
        e.message = message
        raise e


class EmailFormatter:
    def __init__(self, disable_url):
        self.disable_url = disable_url

    def get_message(self):
        return _('This is an automatically sent email please do not reply.') + \
               '\n' + \
               'If you want to unsubscribe you can do it following this link' + self.disable_url

    def get_user_full_name(self, user):
        return user.last_name + ' ' + user.first_name


class PassengerDeleteEmailFormatter(EmailFormatter):
    def __init__(self, passenger, *args, **kwargs):
        super(PassengerDeleteEmailFormatter, self).__init__(*args, **kwargs)
        self.passenger = passenger

    def get_title(self):
        return self.get_user_full_name(self.passenger.travel_user.user) + \
               _(' has been deleted from') + \
               self.get_user_full_name(self.passenger.ride.driver.user) + \
               _('\'s ride')


class PassengerJoinedEmailFormatter(EmailFormatter):
    def __init__(self, passenger, *args, **kwargs):
        super(PassengerJoinedEmailFormatter, self).__init__(*args, **kwargs)
        self.passenger = passenger

    def get_title(self):
        return self.get_user_full_name(self.passenger.travel_user.user) + \
               _(' has joined to your ride.')


class RideChangedEmailFormatter(EmailFormatter):
    def __init__(self, ride, changes, *args, **kwargs):
        super(RideChangedEmailFormatter, self).__init__(*args, **kwargs)
        self.ride = ride
        self.changes = changes

    def get_title(self):
        return self.get_user_full_name(self.ride.driver.user) + _('\'s ride has been changed')

    def get_message(self):
        return _('The following details has been changed:') + \
               '\n' + \
               self.get_changes_text() + \
               super(RideChangedEmailFormatter, self).get_message()

    def get_changes_text(self):
        changes_text = str()
        for change in self.changes:
            changes_text += self.get_change_text(change)
        return changes_text

    def get_change_text(self, change):
        key, val = change.popitem()
        old_version = val['old']
        new_version = val['new']
        return key + ': ' + old_version + '->' + new_version + '\n'


class RideDeletedEmailFormatter(EmailFormatter):
    def __init__(self, ride, *args, **kwargs):
        super(RideDeletedEmailFormatter, self).__init__(*args, **kwargs)
        self.ride = ride

    def get_title(self):
        return self.get_user_full_name(self.ride.driver.user) + \
               _('\'s ride has been deleted')
