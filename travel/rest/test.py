import json
from copy import deepcopy

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from travel.tests import create_user, create_ride, get_ride, create_travel_user, create_passenger_user, get_passenger


class RestUtils:
    def __init__(self, url, user):
        self.api_client = APIClient()
        self.url = url
        self.user = user
        self.login()

    def login(self):
        self.api_client = APIClient()
        self.api_client.force_authenticate(user=self.user)

    def get(self):
        return self.api_client.get(path=self.url, user=self.user)

    def get_and_return_response_body(self):
        return self.get_response_body_as_dict(self.get())

    def get_response_body_as_dict(self, response):
        return json.loads(response.content.decode('utf-8'))

    def post(self, body_dict):
        return self.api_client.post(self.url, body_dict, format='json')

    def post_and_return_reponse_body(self, body_dict):
        return self.get_response_body_as_dict(self.post(body_dict))

    def put(self, body_dict):
        return self.api_client.put(self.url, body_dict, format='json')

    def delete(self):
        return self.api_client.delete(self.url, format='json')


class RestTestBase(APITestCase):
    def assert_get(self, url, expected, user):
        self.assertEqual(RestUtils(url=url, user=user).get_and_return_response_body(), expected)

    def assert_post(self, url, body_dict, expected, user):
        response = RestUtils(url=url, user=user).post_and_return_reponse_body(body_dict=body_dict)
        self.assert_post_response_body(response, expected)

    def assert_post_response_body(self, response, expected):
        response.pop('pk')
        expected.pop('pk')
        self.assertEqual(response, expected)


class UserUtils:
    def user_to_response_dict(self, user):
        return {'pk': user.pk,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email}

    def get_url_for_users(self):
        return '/rest/1/users/'

    def get_url_for_user(self, user):
        return self.get_url_for_users() + str(user.pk) + '/'


class UserRestTest(RestTestBase, UserUtils):
    def setUp(self):
        self.admin = User(username='admin',
                          first_name='admin',
                          last_name='doe',
                          email='admin@doe.com',
                          is_superuser=True)
        self.admin.save()

    def assert_get_has_no_permission(self, url, user):
        self.assertEqual(RestUtils(url=url, user=user).get().status_code, status.HTTP_403_FORBIDDEN)

    def assert_has_create_permission(self, url, user, body_dict):
        self.assert_create_permission(url=url, user=user, body_dict=body_dict, expected=status.HTTP_201_CREATED)

    def assert_create_permission(self, url, user, body_dict, expected):
        response = RestUtils(url=url, user=user).post(body_dict=body_dict)
        self.assertEqual(response.status_code, expected)

    def assert_has_no_create_permission(self, url, user, body_dict):
        self.assert_create_permission(url=url, user=user, body_dict=body_dict, expected=status.HTTP_403_FORBIDDEN)

    def test_get_users_with_admin(self):
        user2 = create_user()
        expected = [self.user_to_response_dict(self.admin), self.user_to_response_dict(user2)]
        self.assert_get(url=self.get_url_for_users(), user=self.admin, expected=expected)

    def test_get_user_with_admin(self):
        create_user()
        expected = self.user_to_response_dict(self.admin)
        self.assert_get(url=self.get_url_for_user(self.admin), user=self.admin, expected=expected)

    def test_get_users_without_permission(self):
        user = create_user()
        self.assert_get_has_no_permission(url=self.get_url_for_users(), user=user)

    def test_get_other_user(self):
        user = create_user()
        self.assert_get_has_no_permission(url=self.get_url_for_user(self.admin), user=user)

    def test_get_own_user(self):
        user = create_user()
        expected = self.user_to_response_dict(user)
        self.assert_get(url=self.get_url_for_user(user), expected=expected, user=user)

    def test_admin_can_create_new_user(self):
        self.assert_has_create_permission(url=self.get_url_for_users(),
                                          user=self.admin,
                                          body_dict={'username': 'john', 'password': 'doe'})

    def test_user_cannot_create_new_user(self):
        self.assert_has_no_create_permission(url=self.get_url_for_users(),
                                             user=create_user(),
                                             body_dict={'username': 'john', 'password': 'doe'})


class RideUtils(UserUtils):
    def get_url_for_rides(self):
        return '/rest/1/rides/'

    def get_url_for_ride(self, ride):
        return self.get_url_for_rides() + str(ride.pk) + '/'

    def travel_user_to_response_dict(self, travel_user):
        return {'pk': travel_user.pk,
                'user': self.user_to_response_dict(travel_user.user),
                'phone': travel_user.phone}

    def ride_to_response_dict(self, ride):
        return {'pk': ride.pk,
                'driver': self.travel_user_to_response_dict(ride.driver),
                'price': ride.price,
                'num_of_seats': ride.num_of_seats,
                'num_of_free_seats': ride.get_num_of_free_seats(),
                'start_time': ride.start_time.isoformat() + 'Z',  # ECMA 262 date time string specification
                'start_location': ride.start_location,
                'car_name': ride.car_name,
                'description': ride.description}

    def get_ride_request_json(self, ride):
        ride_json = self.ride_to_response_dict(ride)
        ride_json.pop('driver')
        return ride_json


class RideRestTest(RestTestBase, RideUtils):
    def test_user_can_list_rides(self):
        user = create_user()
        ride1 = create_ride()
        ride2 = create_ride()
        self.assert_get(url=self.get_url_for_rides(),
                        expected=[self.ride_to_response_dict(ride1),
                                  self.ride_to_response_dict(ride2)],
                        user=user)

    def test_user_can_create_ride(self):
        ride = get_ride()
        self.assert_post(url=self.get_url_for_rides(),
                         body_dict=self.get_ride_request_json(ride),
                         expected=self.ride_to_response_dict(ride),
                         user=ride.driver.user)

    def test_user_cannot_create_ride_in_another_users_name(self):
        ride = get_ride()
        other_user = create_travel_user()
        request_json = self.get_ride_request_json(ride)
        request_json['driver'] = other_user
        with self.assertRaises(expected_exception=TypeError):
            self.assert_post(url=self.get_url_for_rides(),
                             body_dict=request_json,
                             expected=self.ride_to_response_dict(ride),
                             user=ride.driver.user)

    def test_user_can_update_his_ride(self):
        ride = create_ride()
        ride.price += 1
        RestUtils(url=self.get_url_for_ride(ride), user=ride.driver.user).put(
            body_dict=self.get_ride_request_json(ride))
        self.assert_get(url=self.get_url_for_rides(),
                        expected=[self.ride_to_response_dict(ride)],
                        user=ride.driver.user)

    def test_user_cannot_update_other_ones_ride(self):
        user = create_travel_user()
        ride = create_ride()
        response = RestUtils(url=self.get_url_for_ride(ride), user=user.user).put(
            body_dict=self.get_ride_request_json(ride))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_can_delete_his_ride(self):
        ride1 = create_ride()
        ride2 = create_ride()
        RestUtils(url=self.get_url_for_ride(ride1), user=ride1.driver.user).delete()
        self.assert_get(url=self.get_url_for_rides(),
                        expected=[self.ride_to_response_dict(ride2)],
                        user=ride2.driver.user)

    def test_user_cannot_delete_other_ones_ride(self):
        ride1 = create_ride()
        ride2 = create_ride()
        response = RestUtils(url=self.get_url_for_ride(ride2), user=ride1.driver.user).delete()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_cannot_delete_all_cars(self):
        ride1 = create_ride()
        create_ride()
        response = RestUtils(url=self.get_url_for_rides(), user=ride1.driver.user).delete()
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class PassengerUtilities(RideUtils):
    def get_url_for_passenger(self, passenger):
        return self.get_url_for_passengers() + str(passenger.pk) + '/'

    def get_url_for_passengers(self):
        return '/rest/1/passengers/'

    def get_passenger_request_json(self, passenger):
        request_json = self.passenger_to_response_dict(passenger)
        request_json.pop('travel_user')
        return request_json

    def passenger_to_response_dict(self, passenger):
        return {'pk': passenger.pk,
                'travel_user': self.travel_user_to_response_dict(passenger.travel_user),
                'ride': passenger.ride.pk}


class PassengerRestTest(RestTestBase, PassengerUtilities):
    def test_user_can_list_passengers_of_ride(self):
        user = create_user()
        ride = create_ride()
        passenger1 = create_passenger_user(ride)
        passenger2 = create_passenger_user(ride)
        expected = [self.passenger_to_response_dict(passenger1), self.passenger_to_response_dict(passenger2)]
        self.assert_get(url=self.get_url_for_ride(ride) + 'passengers/', expected=expected, user=user)

    def test_user_can_list_passengers(self):
        ride = create_ride()
        user = create_user()
        passenger1 = create_passenger_user(ride)
        passenger2 = create_passenger_user(ride)
        self.assert_get(url=self.get_url_for_passengers(),
                        expected=[self.passenger_to_response_dict(passenger1),
                                  self.passenger_to_response_dict(passenger2)],
                        user=user)

    def test_user_can_be_passenger(self):
        ride = create_ride()
        passenger = get_passenger(ride)
        self.assert_post(url=self.get_url_for_passengers(),
                         user=passenger.travel_user.user,
                         body_dict=self.get_passenger_request_json(passenger),
                         expected=self.passenger_to_response_dict(passenger))

    def test_user_cannot_be_passenger_in_multiple_rides(self):
        ride1 = create_ride()
        ride2 = create_ride()
        passenger1 = get_passenger(ride1)
        RestUtils(url=self.get_url_for_passengers(), user=passenger1.travel_user.user).post(
            body_dict=self.get_passenger_request_json(passenger1))
        passenger2 = deepcopy(passenger1)
        passenger2.ride = ride2
        response_body = RestUtils(url=self.get_url_for_passengers(),
                                  user=passenger1.travel_user.user).post_and_return_reponse_body(
            body_dict=self.get_passenger_request_json(passenger2))
        self.assertEqual(response_body, {'message': 'You can only travel in one ride a travel'})

    def test_passenger_can_change_his_ride(self):
        passenger = create_passenger_user(create_ride())
        passenger.ride = create_ride()
        RestUtils(url=self.get_url_for_passenger(passenger), user=passenger.travel_user.user).put(
            body_dict=self.get_passenger_request_json(passenger))
        self.assert_get(url=self.get_url_for_passengers(),
                        expected=[self.passenger_to_response_dict(passenger)],
                        user=passenger.travel_user.user)

    def test_user_cannot_change_other_passengers_ride(self):
        user = create_user()
        passenger = create_passenger_user(create_ride())
        passenger.ride = create_ride()
        response = RestUtils(url=self.get_url_for_passenger(passenger), user=user).put(
            body_dict=self.get_passenger_request_json(passenger))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_driver_cannot_change_other_passengers_ride(self):
        ride = create_ride()
        passenger = create_passenger_user(create_ride())
        passenger.ride = ride
        response = RestUtils(url=self.get_url_for_passenger(passenger), user=ride.driver.user).put(
            body_dict=self.get_passenger_request_json(passenger))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_passenger_can_delete_himself(self):
        passenger1 = create_passenger_user(create_ride())
        passenger2 = create_passenger_user(create_ride())
        RestUtils(url=self.get_url_for_passenger(passenger1), user=passenger1.travel_user.user).delete()
        self.assert_get(url=self.get_url_for_passengers(),
                        expected=[self.passenger_to_response_dict(passenger2)],
                        user=passenger2.travel_user.user)

    def test_driver_can_delete_his_passenger(self):
        ride = create_ride()
        passenger = create_passenger_user(ride)
        RestUtils(url=self.get_url_for_passenger(passenger), user=ride.driver.user).delete()
        self.assert_get(url=self.get_url_for_passengers(),
                        expected=[],
                        user=ride.driver.user)

    def test_user_cannot_delete_other_passenger(self):
        user = create_user()
        passenger = create_passenger_user(create_ride())
        response = RestUtils(url=self.get_url_for_passenger(passenger), user=user).delete()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_driver_cannot_delete_others_passenger(self):
        ride = create_ride()
        passenger = create_passenger_user(create_ride())
        response = RestUtils(url=self.get_url_for_passenger(passenger), user=ride.driver.user).delete()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
