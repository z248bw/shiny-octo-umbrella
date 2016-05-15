from datetime import datetime

from django.contrib.auth.models import User
from django.core import mail
from django.test import TestCase

from django.utils.crypto import get_random_string

from travel.models import Ride, Passenger, TravelUser
from travel.signals.handlers import RideChangeNotifier
from travel.utils import TravelException, date_to_naive_str


def get_user():
    return User(username=get_random_string(length=5),
                first_name=get_random_string(length=5),
                last_name=get_random_string(length=5),
                email=get_random_string(length=5) +
                      '@' +
                      get_random_string(length=5) +
                      'com')


def create_user():
    user = get_user()
    user.save()
    return user


def get_travel_user():
    user = create_user()
    return TravelUser(user=user,
                      phone=get_random_string(length=5),
                      accepted_eula=True)


def create_travel_user():
    travel_user = get_travel_user()
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


def get_passenger(ride):
    user = create_travel_user()
    return Passenger(travel_user=user, ride=ride)


def create_passenger_user(ride):
    passenger = get_passenger(ride)
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

    def test_passenger_cannot_be_added_to_same_ride_multiple_times(self):
        user = create_travel_user()
        ride = create_ride()
        Passenger(travel_user=user, ride=ride).save()
        with self.assertRaises(expected_exception=TravelException):
            Passenger(travel_user=user, ride=ride).save()

    def test_add_multiple_passengers_to_ride(self):
        ride = create_ride()
        create_passenger_user(ride)
        create_passenger_user(ride)

    def test_passenger_can_be_updated_if_ride_and_passenger_pk_is_not_the_same(self):
        ride = create_ride()
        create_passenger_user(ride)
        passenger = create_passenger_user(ride)
        passenger.save()

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

    def test_driver_cannot_drive_multiple_rides(self):
        user = create_travel_user()
        ride = get_ride()
        ride.driver = user
        ride.save()
        with self.assertRaises(expected_exception=TravelException):
            ride = get_ride()
            ride.driver = user
            ride.save()

    def test_driver_drives_a_ride_and_a_return_ride(self):
        user = create_travel_user()
        ride = get_ride()
        ride.driver = user
        ride.save()
        ride_back = get_ride()
        ride_back.driver = user
        ride_back.is_return = True
        ride_back.save()
        self.assert_expected_actual_model_pks([ride, ride_back], Ride.objects.all())

    def test_passenger_cannot_be_added_to_multiple_rides_there(self):
        user = create_travel_user()
        ride = create_ride()
        other_ride = create_ride()
        Passenger(travel_user=user, ride=ride).save()
        with self.assertRaises(expected_exception=TravelException):
            Passenger(travel_user=user, ride=other_ride).save()

    def test_add_same_passenger_to_ride_and_return_ride(self):
        user = create_travel_user()
        ride = create_ride()
        other_ride = get_ride()
        other_ride.is_return = True
        other_ride.save()
        passenger = Passenger(travel_user=user, ride=ride)
        passenger.save()
        return_passenger = Passenger(travel_user=user, ride=other_ride)
        return_passenger.save()
        self.assert_expected_actual_model_pks(expected=[passenger, return_passenger],
                                              actual=Passenger.objects.filter(travel_user=passenger.travel_user))

    def assert_expected_actual_model_pks(self, expected, actual):
        for i, e in enumerate(expected):
            self.assertEqual(e.pk, actual[i].pk)

    def test_get_passengers_of_ride_with_no_passengers(self):
        ride = create_ride()
        self.assert_expected_actual_model_pks(expected=[], actual=ride.get_passengers())

    def test_get_passengers_of_ride_with_one_passenger(self):
        ride = create_ride()
        expected = [create_passenger_user(ride)]
        self.assert_expected_actual_model_pks(expected=expected, actual=ride.get_passengers())

    def test_get_passengers_of_ride_with_two_passengers(self):
        ride = create_ride()
        expected = [create_passenger_user(ride),
                    create_passenger_user(ride)]
        self.assert_expected_actual_model_pks(expected=expected, actual=ride.get_passengers())

    def test_get_passengers_of_ride_with_passengers_in_the_other_ride(self):
        ride = create_ride()
        other_ride = create_ride()
        create_passenger_user(other_ride)
        self.assert_expected_actual_model_pks(expected=[], actual=ride.get_passengers())

    def test_get_passengers_of_ride_if_passengers_are_deleted(self):
        ride = create_ride()
        passenger = create_passenger_user(ride)
        self.assert_expected_actual_model_pks(expected=[passenger], actual=ride.get_passengers())
        passenger.delete()
        self.assert_expected_actual_model_pks(expected=[], actual=ride.get_passengers())

    def test_get_num_of_free_seats(self):
        ride = create_ride()
        create_passenger_user(ride)
        create_passenger_user(ride)
        self.assertEqual(2, ride.num_of_seats - 2)


class RideUnitTest(TestCase):
    def test_get_changes_on_unsaved_ride(self):
        ride = get_ride()
        self.assertEqual(RideChangeNotifier(ride).get_model_changes(), [])

    def test_get_changes_on_unchanged_ride(self):
        ride = create_ride()
        self.assertEqual(RideChangeNotifier(ride).get_model_changes(), [])

    def test_get_changes_if_one_field_is_changed(self):
        ride = create_ride()
        old_price = ride.price
        ride.price += 1
        ride.save()
        self.assertEqual(RideChangeNotifier(ride).get_model_changes(),
                         [RideChangeNotifier.get_diff_dict('price', str(old_price), str(ride.price))])

    def test_get_changes_if_date_field_is_changed(self):
        ride = create_ride()
        old_time = ride.start_time
        ride.start_time = datetime.now()
        ride.save()
        self.assertEqual(RideChangeNotifier(ride).get_model_changes(), [RideChangeNotifier.get_diff_dict('start_time',
                                                                                                         date_to_naive_str(
                                                                                                             old_time),
                                                                                                         date_to_naive_str(
                                                                                                             ride.start_time))])

    def test_get_changes_if_multiple_field_is_changed(self):
        ride = create_ride()
        old_price = ride.price
        old_location = ride.start_location
        ride.price += 1
        ride.start_location = 'changed location'
        ride.save()
        self.assertEqual(RideChangeNotifier(ride).get_model_changes(), [RideChangeNotifier.get_diff_dict('price',
                                                                                                         str(old_price),
                                                                                                         str(
                                                                                                             ride.price)),
                                                                        RideChangeNotifier.get_diff_dict(
                                                                            'start_location',
                                                                            old_location,
                                                                            ride.start_location)])


class EmailTest(TestCase):
    def test_email_notification_sent_on_passenger_delete_if_enabled(self):
        ride = create_ride()
        passenger = get_passenger(ride)
        passenger.notify_when_deleted = True
        passenger.save()
        passenger.delete()
        self.assertEquals(len(mail.outbox), 1)

    def test_email_notification_not_sent_by_default_on_passenger_delete(self):
        ride = create_ride()
        passenger = create_passenger_user(ride)
        passenger.delete()
        self.assertEquals(len(mail.outbox), 0)

    def test_email_notification_not_sent_for_unchanged_ride(self):
        ride = create_ride()
        passenger = get_passenger(ride)
        passenger.notify_when_ride_changes = True
        passenger.save()
        ride.save()
        self.assertEquals(len(mail.outbox), 0)

    def test_email_notification_not_sent_for_changed_ride_if_there_are_no_passengers_to_notify(self):
        ride = create_ride()
        create_passenger_user(ride)
        ride.price += 1
        ride.save()
        self.assertEquals(len(mail.outbox), 0)

    def test_email_notification_sent_for_changed_ride(self):
        ride = create_ride()
        passenger = self.create_ride_change_notifiable_passenger(ride)
        ride.price += 1
        ride.save()
        self.assertEquals(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [passenger.travel_user.user.email])

    def create_ride_change_notifiable_passenger(self, ride):
        passenger = get_passenger(ride)
        passenger.notify_when_ride_changes = True
        passenger.save()
        return passenger

    def test_email_notification_sent_for_changed_ride_for_notifiable_passengers(self):
        ride = create_ride()
        passenger = self.create_ride_change_notifiable_passenger(ride)
        create_passenger_user(ride)
        create_passenger_user(ride)
        ride.price += 1
        ride.save()
        self.assertEquals(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [passenger.travel_user.user.email])

    def test_email_notification_sent_for_changed_ride_for_multiple_passengers(self):
        ride = create_ride()
        passenger1 = self.create_ride_change_notifiable_passenger(ride)
        passenger2 = self.create_ride_change_notifiable_passenger(ride)
        ride.price += 1
        ride.save()
        self.assertEquals(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [passenger1.travel_user.user.email, passenger2.travel_user.user.email])

    def test_email_notification_not_sent_about_passenger_join_if_it_is_disabled(self):
        create_passenger_user(create_ride())
        self.assertEquals(len(mail.outbox), 0)

    def test_email_notification_not_sent_about_passenger_update_if_it_is_enabled(self):
        ride = create_ride()
        passenger = create_passenger_user(ride)
        ride.notify_when_passenger_joins = True
        ride.save()
        passenger.notify_when_ride_is_deleted = True
        passenger.save()
        self.assertEquals(len(mail.outbox), 0)

    def test_email_notification_sent_about_passenger_join_if_it_is_enabled(self):
        ride = get_ride()
        ride.notify_when_passenger_joins = True
        ride.save()
        create_passenger_user(ride)
        self.assertEquals(len(mail.outbox), 1)

    def test_email_notification_not_sent_about_ride_delete_if_it_is_not_enabled(self):
        ride = create_ride()
        create_passenger_user(ride)
        ride.delete()
        self.assertEquals(len(mail.outbox), 0)

    def test_email_notification_sent_about_ride_delete_if_it_is_enabled(self):
        ride = create_ride()
        passenger = get_passenger(ride)
        passenger.notify_when_ride_is_deleted = True
        passenger.save()
        ride.delete()
        self.assertEquals(len(mail.outbox), 1)
