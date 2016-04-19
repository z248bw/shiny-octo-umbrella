from django.contrib.auth.models import User
from django.db import models


class AbstractPerson(models.Model):
    phone = models.CharField(max_length=15, verbose_name='Telefon', null=True, blank=True)

    class Meta:
        abstract = True


class Ride(AbstractPerson):
    driver = models.OneToOneField(User, on_delete=models.CASCADE)
    price = models.IntegerField(verbose_name='Ar')
    num_of_seats = models.IntegerField(verbose_name='Ferohelyek szama(soforules nelkul)')
    start_time = models.DateTimeField(verbose_name='Indulasi ido')
    start_location = models.CharField(max_length=100, verbose_name='Indulasi hely')
    car_name = models.CharField(max_length=20, verbose_name='Auto tipusa', null=True, blank=True)
    description = models.CharField(max_length=100, verbose_name='Egyeb', null=True, blank=True)

    class NoDriverContactProvidedException(Exception):
        pass

    def get_passengers(self):
        return Passenger.objects.filter(ride=self.pk)

    def get_num_of_free_seats(self):
        return self.num_of_seats - len(self.get_passengers())

    def save(self, *args, **kwargs):
        self.check_driver_contact_info()
        super(Ride, self).save(*args, **kwargs)

    def check_driver_contact_info(self):
        if self.driver.last_name == '' \
                or self.driver.first_name == '' \
                or self.driver.email == '':
            raise Ride.NoDriverContactProvidedException


class Passenger(AbstractPerson):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    ride = models.ForeignKey(Ride, related_name='ride', verbose_name='Fuvar')

    class NoMoreSpaceException(Exception):
        pass

    class DriverCannotBePassengerException(Exception):
        pass

    @staticmethod
    def take_a_seat(user, ride):
        if len(Ride.objects.filter(driver=user)) > 0:
            raise Passenger.DriverCannotBePassengerException
        passenger = Passenger(user=user, ride=ride)
        if ride.get_num_of_free_seats() == 0:
            raise Passenger.NoMoreSpaceException
        passenger.save()
        return user
