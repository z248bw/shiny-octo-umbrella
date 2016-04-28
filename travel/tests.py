from datetime import datetime

from django.contrib.auth.models import User
from django.db import IntegrityError
from django.test import TestCase

from django.utils.crypto import get_random_string

from travel.models import Ride, Passenger, TravelUser


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


def create_travel_user():
    user = create_user()
    travel_user = TravelUser(user=user, phone=get_random_string(length=5))
    travel_user.save()
    return travel_user


def get_ride():
    return Ride(driver=create_travel_user(),
                price=0,
                num_of_seats=4,
                start_time=datetime(2015, 1, 1, 12, 0, 0),
                start_location='asd street')


def create_ride():
    ride = get_ride()
    ride.save()
    return ride


def create_passenger_user(ride):
    user = create_travel_user()
    passenger = Passenger(travel_user=user, ride=ride)
    passenger.save()
    return passenger


class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)


class RideTest(TestCase):
    def test_save_ride_with_less_than_one_seats(self):
        ride = create_ride()
        ride.num_of_seats = 0
        with self.assertRaises(expected_exception=Ride.NotEnoughFreeSeatsException):
            ride.save()

    def test_save_ride_without_driver_email(self):
        with self.assertRaisesMessage(expected_exception=Ride.NoDriverContactProvidedException,
                                      expected_message=''):
            noname_user = User(username='noname', password='')
            noname_user.save()
            driver = TravelUser(user=noname_user, phone=get_random_string(5))
            driver.save()
            Ride(driver=driver,
                 price=0,
                 num_of_seats=1,
                 start_time=datetime(2015, 1, 1, 12, 0, 0),
                 start_location='asd street').save()

    def test_create_ride_passenger_if_ride_has_no_free_seat(self):
        ride_with_no_space = Ride(driver=create_travel_user(),
                                  price=0,
                                  num_of_seats=1,
                                  start_time=datetime(2015, 1, 1, 12, 0, 0),
                                  start_location='asd street')
        ride_with_no_space.save()
        create_passenger_user(ride_with_no_space)
        with self.assertRaisesMessage(expected_exception=Passenger.NoMoreSpaceException,
                                      expected_message=''):
            create_passenger_user(ride_with_no_space)

    def test_create_ride_passenger_if_ride_has_free_seats(self):
        ride = create_ride()
        passenger = create_passenger_user(ride)
        self.assertEqual(passenger.ride, ride)

    def test_add_same_passenger_to_ride_multiple_times(self):
        user = create_travel_user()
        ride = create_ride()
        Passenger(travel_user=user, ride=ride).save()
        with self.assertRaises(expected_exception=IntegrityError):
            Passenger(travel_user=user, ride=ride,).save()

    def test_add_driver_as_passenger(self):
        ride = create_ride()
        with self.assertRaises(expected_exception=Passenger.DriverCannotBePassengerException,
                               expected_message=''):
            Passenger(travel_user=ride.driver, ride=ride).save()

    def test_add_driver_as_passenger_in_another_ride(self):
        ride = create_ride()
        other_ride = create_ride()
        with self.assertRaises(expected_exception=Passenger.DriverCannotBePassengerException,
                               expected_message=''):
            Passenger(travel_user=ride.driver, ride=other_ride).save()

    def test_driver_drives_multiple_rides(self):
        user = create_travel_user()
        ride = Ride(driver=user,
                    price=0,
                    num_of_seats=1,
                    start_time=datetime(2015, 1, 1, 12, 0, 0),
                    start_location='asd street')
        ride.save()
        with self.assertRaises(expected_exception=IntegrityError,
                               expected_message=''):
            ride = Ride(driver=user,
                        price=0,
                        num_of_seats=1,
                        start_time=datetime(2015, 1, 1, 12, 0, 0),
                        start_location='asd street')
            ride.save()

    def test_add_same_passenger_to_multiple_rides(self):
        user = create_travel_user()
        ride = create_ride()
        other_ride = create_ride()
        Passenger(travel_user=user, ride=ride).save()
        with self.assertRaises(expected_exception=IntegrityError):
            Passenger(travel_user=user, ride=other_ride).save()

    def assert_passengers(self, expected, actual):
        for i, e in enumerate(expected):
            self.assertEqual(e.pk, actual[i].pk)

    def test_get_passengers_of_ride_with_no_passengers(self):
        ride = create_ride()
        self.assert_passengers(expected=[], actual=ride.get_passengers())

    def test_get_passengers_of_ride_with_one_passenger(self):
        ride = create_ride()
        expected = [create_passenger_user(ride)]
        self.assert_passengers(expected=expected, actual=ride.get_passengers())

    def test_get_passengers_of_ride_with_two_passengers(self):
        ride = create_ride()
        expected = [create_passenger_user(ride),
                    create_passenger_user(ride)]
        self.assert_passengers(expected=expected, actual=ride.get_passengers())

    def test_get_passengers_of_ride_with_passengers_in_the_other_ride(self):
        ride = create_ride()
        other_ride = create_ride()
        create_passenger_user(other_ride)
        self.assert_passengers(expected=[], actual=ride.get_passengers())

    def test_get_passengers_of_ride_if_passengers_are_deleted(self):
        ride = create_ride()
        passenger = create_passenger_user(ride)
        self.assert_passengers(expected=[passenger], actual=ride.get_passengers())
        passenger.delete()
        self.assert_passengers(expected=[], actual=ride.get_passengers())

    def test_get_num_of_free_seats(self):
        ride = create_ride()
        create_passenger_user(ride)
        create_passenger_user(ride)
        self.assertEqual(2, ride.num_of_seats - 2)
