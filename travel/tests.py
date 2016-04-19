from datetime import datetime

from django.contrib.auth.models import User
from django.db import IntegrityError
from django.test import TestCase

from django.utils.crypto import get_random_string

from travel.models import Ride, Passenger


def create_user():
    user = User(username=get_random_string(length=5),
                first_name=get_random_string(length=5),
                last_name=get_random_string(length=5),
                email=get_random_string(length=5) +
                      '@' +
                      get_random_string(length=5) +
                      'com')
    user.save()
    return user


class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)


class ModelTestBase:
    def create_passenger_user(self, ride):
        return Passenger.take_a_seat(user=create_user(), ride=ride, phone=get_random_string(length=5))


class CarTest(TestCase, ModelTestBase):
    def create_ride(self):
        ride = Ride(driver=create_user(),
                    phone=get_random_string(length=5),
                    price=0,
                    num_of_seats=4,
                    start_time=datetime(2015, 1, 1, 12, 0, 0),
                    start_location='asd street')
        ride.save()
        return ride

    def test_save_ride_without_driver_email(self):
        with self.assertRaisesMessage(expected_exception=Ride.NoDriverContactProvidedException,
                                      expected_message=''):
            noname_user = User(username='noname', password='')
            noname_user.save()
            Ride(driver=noname_user,
                 price=0,
                 num_of_seats=0,
                 start_time=datetime(2015, 1, 1, 12, 0, 0),
                 start_location='asd street').save()

    def test_create_ride_passenger_if_ride_has_no_free_seat(self):
        ride_with_no_space = Ride(driver=create_user(),
                                  price=0,
                                  num_of_seats=0,
                                  start_time=datetime(2015, 1, 1, 12, 0, 0),
                                  start_location='asd street')
        ride_with_no_space.save()
        with self.assertRaisesMessage(expected_exception=Passenger.NoMoreSpaceException,
                                      expected_message=''):
            self.create_passenger_user(ride_with_no_space)

    def test_create_ride_passenger_if_ride_has_free_seats(self):
        ride = self.create_ride()
        user = self.create_passenger_user(ride)
        self.assertEqual(user.passenger.ride, ride)

    def test_add_same_passenger_to_ride_multiple_times(self):
        user = User(username=get_random_string(length=5),
                    password='')
        user.save()
        ride = self.create_ride()
        Passenger.take_a_seat(user=user, ride=ride, phone=get_random_string(5))
        with self.assertRaises(expected_exception=IntegrityError):
            Passenger.take_a_seat(user=user, ride=ride, phone=get_random_string(5))

    def test_add_driver_as_passenger(self):
        ride = self.create_ride()
        with self.assertRaises(expected_exception=Passenger.DriverCannotBePassengerException,
                               expected_message=''):
            Passenger.take_a_seat(user=ride.driver, ride=ride, phone=get_random_string(5))

    def test_add_driver_as_passenger_in_another_ride(self):
        ride = self.create_ride()
        other_ride = self.create_ride()
        with self.assertRaises(expected_exception=Passenger.DriverCannotBePassengerException,
                               expected_message=''):
            Passenger.take_a_seat(user=ride.driver, ride=other_ride, phone=get_random_string(5))

    def test_driver_drives_multiple_rides(self):
        user = create_user()
        ride = Ride(driver=user,
                    price=0,
                    num_of_seats=0,
                    start_time=datetime(2015, 1, 1, 12, 0, 0),
                    start_location='asd street')
        ride.save()
        with self.assertRaises(expected_exception=IntegrityError,
                               expected_message=''):
            ride = Ride(driver=user,
                        price=0,
                        num_of_seats=0,
                        start_time=datetime(2015, 1, 1, 12, 0, 0),
                        start_location='asd street')
            ride.save()

    def test_add_same_passenger_to_multiple_rides(self):
        user = User(username=get_random_string(length=5),
                    password='')
        user.save()
        ride = self.create_ride()
        other_ride = self.create_ride()
        Passenger.take_a_seat(user=user, ride=ride, phone=get_random_string(5))
        with self.assertRaises(expected_exception=IntegrityError):
            Passenger.take_a_seat(user=user, ride=other_ride, phone=get_random_string(5))

    def assert_passengers(self, expected, actual):
        for i, e in enumerate(expected):
            self.assertEqual(e.pk, actual[i].pk)

    def test_get_passengers_of_ride_with_no_passengers(self):
        ride = self.create_ride()
        self.assert_passengers(expected=[], actual=ride.get_passengers())

    def test_get_passengers_of_ride_with_one_passenger(self):
        ride = self.create_ride()
        expected = [self.create_passenger_user(ride).passenger]
        self.assert_passengers(expected=expected, actual=ride.get_passengers())

    def test_get_passengers_of_ride_with_two_passengers(self):
        ride = self.create_ride()
        expected = [self.create_passenger_user(ride).passenger,
                    self.create_passenger_user(ride).passenger]
        self.assert_passengers(expected=expected, actual=ride.get_passengers())

    def test_get_passengers_of_ride_with_passengers_in_the_other_ride(self):
        ride = self.create_ride()
        other_ride = self.create_ride()
        self.create_passenger_user(other_ride)
        self.assert_passengers(expected=[], actual=ride.get_passengers())

    def test_get_passengers_of_ride_if_passengers_are_deleted(self):
        ride = self.create_ride()
        user = self.create_passenger_user(ride)
        self.assert_passengers(expected=[user.passenger], actual=ride.get_passengers())
        user.delete()
        self.assert_passengers(expected=[], actual=ride.get_passengers())

    def test_get_num_of_free_seats(self):
        ride = self.create_ride()
        self.create_passenger_user(ride)
        self.create_passenger_user(ride)
        self.assertEqual(2, ride.num_of_seats - 2)
