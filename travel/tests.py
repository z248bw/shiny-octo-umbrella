from datetime import datetime

from django.contrib.auth.models import User
from django.db import IntegrityError
from django.test import TestCase

from django.utils.crypto import get_random_string

from travel.models import Car, Passenger, Driver


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
    def create_passenger_user(self, car):
        return Passenger.take_a_seat(user=create_user(), car=car)


class CarTest(TestCase, ModelTestBase):
    def create_car(self):
        driver = Driver(user=create_user())
        driver.save()
        car = Car(driver=driver,
                  price=0,
                  num_of_seats=4,
                  start_time=datetime(2015, 1, 1, 12, 0, 0),
                  start_location='asd street')
        car.save()
        return car

    def test_save_car_without_driver_email(self):
        with self.assertRaisesMessage(expected_exception=Car.NoDriverContactProvidedException,
                                      expected_message=''):
            noname_user = User(username='noname', password='')
            noname_user.save()
            noname_driver = Driver(user=noname_user)
            noname_driver.save()
            Car(driver=noname_driver,
                price=0,
                num_of_seats=0,
                start_time=datetime(2015, 1, 1, 12, 0, 0),
                start_location='asd street').save()

    def test_create_car_passenger_if_car_has_no_free_seat(self):
        driver = Driver(user=create_user())
        driver.save()
        car_with_no_space = Car(driver=driver,
                                price=0,
                                num_of_seats=0,
                                start_time=datetime(2015, 1, 1, 12, 0, 0),
                                start_location='asd street')
        car_with_no_space.save()
        with self.assertRaisesMessage(expected_exception=Passenger.NoMoreSpaceException,
                                      expected_message=''):
            self.create_passenger_user(car_with_no_space)

    def test_create_car_passenger_if_car_has_free_seats(self):
        car = self.create_car()
        user = self.create_passenger_user(car)
        self.assertEqual(user.passenger.car, car)

    def test_add_same_passenger_to_car_multiple_times(self):
        user = User(username=get_random_string(length=5),
                    password='')
        user.save()
        car = self.create_car()
        Passenger.take_a_seat(user=user, car=car)
        with self.assertRaises(expected_exception=IntegrityError):
            Passenger.take_a_seat(user=user, car=car)

    def test_add_driver_as_passenger(self):
        car = self.create_car()
        with self.assertRaises(expected_exception=Passenger.DriverCannotBePassengerException,
                               expected_message=''):
            Passenger.take_a_seat(user=car.driver.user, car=car)

    def test_add_driver_as_passenger_in_another_car(self):
        car = self.create_car()
        other_car = self.create_car()
        with self.assertRaises(expected_exception=Passenger.DriverCannotBePassengerException,
                               expected_message=''):
            Passenger.take_a_seat(user=car.driver.user, car=other_car)

    def test_driver_drives_multiple_cars(self):
        driver = Driver(user=create_user())
        driver.save()
        car = Car(driver=driver,
                  price=0,
                  num_of_seats=0,
                  start_time=datetime(2015, 1, 1, 12, 0, 0),
                  start_location='asd street')
        car.save()
        with self.assertRaises(expected_exception=IntegrityError,
                               expected_message=''):
            car = Car(driver=driver,
                      price=0,
                      num_of_seats=0,
                      start_time=datetime(2015, 1, 1, 12, 0, 0),
                      start_location='asd street')
            car.save()

    def test_add_same_passenger_to_multiple_cars(self):
        user = User(username=get_random_string(length=5),
                    password='')
        user.save()
        car = self.create_car()
        other_car = self.create_car()
        Passenger.take_a_seat(user=user, car=car)
        with self.assertRaises(expected_exception=IntegrityError):
            Passenger.take_a_seat(user=user, car=other_car)

    def assert_passengers(self, expected, actual):
        for i, e in enumerate(expected):
            self.assertEqual(e.pk, actual[i].pk)

    def test_get_passengers_of_car_with_no_passengers(self):
        car = self.create_car()
        self.assert_passengers(expected=[], actual=car.get_passengers())

    def test_get_passengers_of_car_with_one_passenger(self):
        car = self.create_car()
        expected = [self.create_passenger_user(car).passenger]
        self.assert_passengers(expected=expected, actual=car.get_passengers())

    def test_get_passengers_of_car_with_two_passengers(self):
        car = self.create_car()
        expected = [self.create_passenger_user(car).passenger,
                    self.create_passenger_user(car).passenger]
        self.assert_passengers(expected=expected, actual=car.get_passengers())

    def test_get_passengers_of_car_with_passengers_in_the_other_car(self):
        car = self.create_car()
        other_car = self.create_car()
        self.create_passenger_user(other_car)
        self.assert_passengers(expected=[], actual=car.get_passengers())

    def test_get_passengers_of_car_if_passengers_are_deleted(self):
        car = self.create_car()
        user = self.create_passenger_user(car)
        self.assert_passengers(expected=[user.passenger], actual=car.get_passengers())
        user.delete()
        self.assert_passengers(expected=[], actual=car.get_passengers())

    def test_get_num_of_free_seats(self):
        car = self.create_car()
        self.create_passenger_user(car)
        self.create_passenger_user(car)
        self.assertEqual(2, car.num_of_seats - 2)
