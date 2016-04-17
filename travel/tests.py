from datetime import datetime

from django.contrib.auth.models import User
from django.db import IntegrityError
from django.test import TestCase

from django.utils.crypto import get_random_string

from travel.models import Car, Passenger


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
    def setUp(self):
        self.driver = create_user()
        self.driver.save()
        self.car1 = Car(driver=self.driver,
                        car_name='ford',
                        price=0,
                        num_of_seats=4,
                        start_time=datetime(2015, 1, 1, 12, 0, 0),
                        start_location='asd street')
        self.car1.save()
        self.car2 = Car(driver=self.driver,
                        car_name='ford',
                        price=0,
                        num_of_seats=4,
                        start_time=datetime(2015, 1, 1, 12, 0, 0),
                        start_location='asd street')
        self.car2.save()

    def test_save_car_without_driver_email(self):
        with self.assertRaisesMessage(expected_exception=Car.NoDriverContactProvidedException,
                                      expected_message=''):
            noname_user = User(username='noname', password='')
            noname_user.save()
            Car(driver=noname_user,
                car_name='ford',
                price=0,
                num_of_seats=0,
                start_time=datetime(2015, 1, 1, 12, 0, 0),
                start_location='asd street').save()

    def test_create_car_passenger_if_car_has_no_free_seat(self):
        car_with_no_space = Car(driver=self.driver,
                                car_name='ford',
                                price=0,
                                num_of_seats=0,
                                start_time=datetime(2015, 1, 1, 12, 0, 0),
                                start_location='asd street')
        car_with_no_space.save()
        with self.assertRaisesMessage(expected_exception=Passenger.NoMoreSpaceException,
                                      expected_message=''):
            self.create_passenger_user(car_with_no_space)

    def test_create_car_passenger_if_car_has_free_seats(self):
        user = self.create_passenger_user(self.car1)
        self.assertEqual(user.passenger.car, self.car1)

    def test_add_same_passenger_to_car_multiple_times(self):
        user = User(username=get_random_string(length=5),
                    password='')
        user.save()
        Passenger.take_a_seat(user=user, car=self.car1)
        with self.assertRaises(expected_exception=IntegrityError):
            Passenger.take_a_seat(user=user, car=self.car1)

    def test_add_driver_as_passenger(self):
        car = self.create_car_with_driver()
        with self.assertRaises(expected_exception=Passenger.DriverCannotBePassengerException,
                               expected_message=''):
            Passenger.take_a_seat(user=car.driver, car=car)

    def test_add_driver_as_passenger_in_another_car(self):
        car = self.create_car_with_driver()
        with self.assertRaises(expected_exception=Passenger.DriverCannotBePassengerException,
                               expected_message=''):
            Passenger.take_a_seat(user=car.driver, car=self.car1)

    def create_car_with_driver(self):
        driver = create_user()
        driver.save()
        car = Car(driver=driver,
                  car_name='ford',
                  price=0,
                  num_of_seats=4,
                  start_time=datetime(2015, 1, 1, 12, 0, 0),
                  start_location='asd street')
        car.save()
        return car

    def test_add_same_passenger_to_multiple_cars(self):
        user = User(username=get_random_string(length=5),
                    password='')
        user.save()
        Passenger.take_a_seat(user=user, car=self.car1)
        with self.assertRaises(expected_exception=IntegrityError):
            Passenger.take_a_seat(user=user, car=self.car2)

    def assert_passengers(self, expected, actual):
        for i, e in enumerate(expected):
            self.assertEqual(e.pk, actual[i].pk)

    def test_get_passengers_of_car_with_no_passengers(self):
        self.assert_passengers(expected=[], actual=self.car1.get_passengers())

    def test_get_passengers_of_car_with_one_passenger(self):
        expected = [self.create_passenger_user(self.car1).passenger]
        self.assert_passengers(expected=expected, actual=self.car1.get_passengers())

    def test_get_passengers_of_car_with_two_passengers(self):
        expected = [self.create_passenger_user(self.car1).passenger,
                    self.create_passenger_user(self.car1).passenger]
        self.assert_passengers(expected=expected, actual=self.car1.get_passengers())

    def test_get_passengers_of_car_with_passengers_in_the_other_car(self):
        self.assert_passengers(expected=[], actual=self.car2.get_passengers())

    def test_get_passengers_of_car_if_passengers_are_deleted(self):
        user = self.create_passenger_user(self.car1)
        self.assert_passengers(expected=[user.passenger], actual=self.car1.get_passengers())
        user.delete()
        self.assert_passengers(expected=[], actual=self.car1.get_passengers())

    def test_get_num_of_free_seats(self):
        self.create_passenger_user(self.car1)
        self.create_passenger_user(self.car1)
        self.assertEqual(2, self.car1.num_of_seats - 2)
