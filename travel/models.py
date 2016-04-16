from django.contrib.auth.models import User
from django.db import models


class Car(models.Model):
    driver = models.ForeignKey(User, related_name='driver', verbose_name='Sofor')
    car_name = models.CharField(max_length=20, verbose_name='Auto tipusa')
    price = models.IntegerField(verbose_name='Ar')
    num_of_seats = models.IntegerField(verbose_name='Ferohelyek szama(soforules nelkul)')
    start_time = models.DateTimeField(verbose_name='Indulasi ido')
    start_location = models.CharField(max_length=100, verbose_name='Indulasi hely')
    description = models.CharField(max_length=100, verbose_name='Egyeb', null=True, blank=True)

    def get_passengers(self):
        return Passenger.objects.filter(car=self.pk)

    def get_num_of_free_seats(self):
        return self.num_of_seats - len(self.get_passengers())


class Passenger(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    car = models.ForeignKey(Car, related_name='car', verbose_name='Auto')

    class NoMoreSpaceException(Exception):
        pass

    @staticmethod
    def take_a_seat(user, car):
        passenger = Passenger(user=user, car=car)
        if car.get_num_of_free_seats() == 0:
            raise Passenger.NoMoreSpaceException
        passenger.save()
        return user
