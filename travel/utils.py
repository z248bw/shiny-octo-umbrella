from django.core.mail import send_mail


def date_to_naive_str(date):
    return date.replace(tzinfo=None).isoformat()


class EmailNotifier:
    def __init__(self, to, formatter):
        self.to = to
        self.formatter = formatter

    def notify(self):
        send_mail(self.formatter.get_title(), self.formatter.get_message(),
                  'travelmanager@wedding.com', self.to, fail_silently=False)


class EmailFormatter:
    def __init__(self, disable_url):
        self.disable_url = disable_url

    def get_message(self):
        return 'Ez egy automatikusan kuldott uzenet kerlek ne valaszolj ra.' \
               '\nHa nem szeretnel tobb uzenetet kapni le tudsz iratkozni a kovetkezo linken: ' + self.disable_url

    def get_user_full_name(self, user):
        return user.last_name + ' ' + user.first_name


class PassengerDeleteEmailFormatter(EmailFormatter):
    def __init__(self, passenger, *args, **kwargs):
        super(PassengerDeleteEmailFormatter, self).__init__(*args, **kwargs)
        self.passenger = passenger

    def get_title(self):
        return self.get_user_full_name(self.passenger.travel_user.user) \
               + ' torlesre kerult ' \
               + self.get_user_full_name(self.passenger.ride.driver.user) \
               + ' fuvarjarol'


class PassengerJoinedEmailFormatter(EmailFormatter):
    def __init__(self, passenger, *args, **kwargs):
        super(PassengerJoinedEmailFormatter, self).__init__(*args, **kwargs)
        self.passenger = passenger

    def get_title(self):
        return self.get_user_full_name(self.passenger.travel_user.user) \
               + ' csatlakozott ' \
               + ' a fuvarodhoz'


class RideChangedEmailFormatter(EmailFormatter):
    def __init__(self, ride, changes, *args, **kwargs):
        super(RideChangedEmailFormatter, self).__init__(*args, **kwargs)
        self.ride = ride
        self.changes = changes

    def get_title(self):
        return self.get_user_full_name(self.ride.driver.user) + ' fuvarja megvaltozott'

    def get_message(self):
        return 'A kovetkezo reszletek valtoztak:\n' \
               + self.get_changes_text() \
               + super(RideChangedEmailFormatter, self).get_message()

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


class TravelException(Exception):
    @staticmethod
    def raise_exception(message):
        e = TravelException()
        e.message = message
        raise e
