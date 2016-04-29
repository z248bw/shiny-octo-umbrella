from django.core.mail import send_mail


class EmailNotifier:
    def __init__(self, to, formatter):
        self.to = to
        self.formatter = formatter

    def notify(self):
        send_mail(self.formatter.get_title(), self.formatter.get_message(),
                  'travelmanager@wedding.com', self.to, fail_silently=False)


class PassengerDeleteEmailFormatter:
    def __init__(self, driver, passenger, disable_url):
        self.driver = driver
        self.passenger = passenger
        self.disable_url = disable_url

    def get_message(self):
        return 'Ez egy automatikusan kuldott uzenet kerlek ne valaszolj ra.' \
               '\nHa nem szeretnel tobb uzenetet kapni le tudsz iratkozni a kovetkezo linken: ' + self.disable_url

    def get_title(self):
        return self.get_user_full_name(self.passenger.user)\
               + ' torlesre kerult '\
               + self.get_user_full_name(self.driver.user)\
               + ' fuvarjarol'

    def get_user_full_name(self, user):
        return user.last_name + ' ' + user.first_name


class TravelException(Exception):
    @staticmethod
    def raise_exception(message):
        e = TravelException()
        e.message = message
        raise e
