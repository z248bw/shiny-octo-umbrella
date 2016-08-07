from django.db.models.signals import post_save, post_delete, pre_delete
from django.dispatch import receiver

from travel.models import Passenger, Ride
from travel.notifiers.notifiers import PassengerJoinedNotifier, PassengerDeletedNotifier, RideChangeNotifier, \
    RideDeletedNotifier


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
