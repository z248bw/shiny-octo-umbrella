import json

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from travel.tests import create_user, create_ride, get_ride, create_travel_user, create_passenger_user


class MainRestTest(APITestCase):
    def setUp(self):
        self.admin = User(username='admin',
                          first_name='admin',
                          last_name='doe',
                          email='admin@doe.com',
                          is_superuser=True)
        self.admin.save()

    def assert_get(self, url, expected, user=None):
        response = self.get(url=url, user=user)
        self.assertEqual(self.get_response_body(response), expected)

    def get_response_body(self, response):
        return json.loads(response.content.decode('utf-8'))

    def get(self, url, user):
        user = self.login_with_user_or_admin(user)
        return self.client.get(path=url, user=user)

    def login_with_user_or_admin(self, user):
        user = self.admin if user is None else user
        self.client.force_authenticate(user=user)
        return user

    def assert_get_has_no_permission(self, url, user):
        self.assertEqual(self.get(url=url, user=user).status_code, 403)

    def assert_has_create_permission(self, url, user, body_dict):
        self.assert_create_permission(url=url, user=user, body_dict=body_dict, expected=201)

    def assert_create_permission(self, url, user, body_dict, expected):
        response = self.post(url=url, user=user, body_dict=body_dict)
        self.assertEqual(response.status_code, expected)

    def post(self, url, user, body_dict):
        self.login_with_user_or_admin(user)
        return self.client.post(url, body_dict, format='json')

    def assert_has_no_create_permission(self, url, user, body_dict):
        self.assert_create_permission(url=url, user=user, body_dict=body_dict, expected=403)

    def get_url_for_users(self):
        return '/rest/1/users/'

    def get_url_for_user(self, user):
        return self.get_url_for_users() + str(user.pk) + '/'

    def test_get_users_with_admin(self):
        user2 = create_user()
        expected = [self.user_to_response_dict(self.admin), self.user_to_response_dict(user2)]
        self.assert_get(url=self.get_url_for_users(), expected=expected)

    def user_to_response_dict(self, user):
        return {'pk': user.pk,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email}

    def test_get_user_with_admin(self):
        create_user()
        expected = self.user_to_response_dict(self.admin)
        self.assert_get(url=self.get_url_for_user(self.admin), expected=expected)

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

    def get_url_for_rides(self):
        return '/rest/1/rides/'

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

    def test_user_can_list_rides(self):
        user = create_user()
        ride1 = create_ride()
        ride2 = create_ride()
        self.assert_get(url=self.get_url_for_rides(),
                        expected=[self.ride_to_response_dict(ride1),
                                  self.ride_to_response_dict(ride2)],
                        user=user)

    def travel_user_to_response_dict(self, travel_user):
        return {'pk': travel_user.pk,
                'user': self.user_to_response_dict(travel_user.user),
                'phone': travel_user.phone}

    def test_user_can_create_ride(self):
        ride = get_ride()
        self.assert_post(url=self.get_url_for_rides(),
                         body_dict=self.get_ride_request_json(ride),
                         expected=self.ride_to_response_dict(ride),
                         user=ride.driver.user)

    def get_ride_request_json(self, ride):
        ride_json = self.ride_to_response_dict(ride)
        ride_json.pop('driver')
        return ride_json

    def assert_post(self, url, body_dict, expected, user=None):
        response = self.get_response_body(self.post(url=url, user=user, body_dict=body_dict))
        self.assert_post_response_body(response, expected)

    def assert_post_response_body(self, response, expected):
        response.pop('pk')
        expected.pop('pk')
        self.assertEqual(response, expected)

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
        self.put(url=self.get_url_for_ride(ride),
                 body_dict=self.get_ride_request_json(ride),
                 user=ride.driver.user)
        self.assert_get(url=self.get_url_for_rides(),
                        expected=[self.ride_to_response_dict(ride)],
                        user=ride.driver.user)

    def put(self, url, user, body_dict):
        self.login_with_user_or_admin(user)
        return self.client.put(url, body_dict, format='json')

    def get_url_for_ride(self, ride):
        return self.get_url_for_rides() + str(ride.pk) + '/'

    def test_user_cannot_update_other_ones_ride(self):
        user = create_travel_user()
        ride = create_ride()
        response = self.put(url=self.get_url_for_ride(ride),
                            body_dict=self.get_ride_request_json(ride),
                            user=user.user)
        self.assertEqual(response.status_code, 403)

    def test_user_can_delete_his_ride(self):
        ride1 = create_ride()
        ride2 = create_ride()
        self.delete(url=self.get_url_for_ride(ride1),
                    user=ride1.driver.user)
        self.assert_get(url=self.get_url_for_rides(),
                        expected=[self.ride_to_response_dict(ride2)],
                        user=ride2.driver.user)

    def delete(self, url, user):
        self.login_with_user_or_admin(user)
        return self.client.delete(url, format='json')

    def test_user_cannot_delete_other_ones_ride(self):
        ride1 = create_ride()
        ride2 = create_ride()
        response = self.delete(url=self.get_url_for_ride(ride2),
                               user=ride1.driver.user)
        self.assertEqual(response.status_code, 403)

    def test_user_cannot_delete_all_cars(self):
        ride1 = create_ride()
        create_ride()
        response = self.delete(url=self.get_url_for_rides(),
                               user=ride1.driver.user)
        self.assertEqual(response.status_code, 405)

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

    def test_passenger_can_change_his_ride(self):
        passenger = create_passenger_user(create_ride())
        passenger.ride = create_ride()
        self.put(url=self.get_url_for_passenger(passenger),
                 body_dict=self.get_passenger_request_json(passenger),
                 user=passenger.travel_user.user)
        self.assert_get(url=self.get_url_for_passengers(),
                        expected=[self.passenger_to_response_dict(passenger)],
                        user=passenger.travel_user.user)

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

    def test_user_cannot_change_other_passengers_ride(self):
        user = create_user()
        passenger = create_passenger_user(create_ride())
        passenger.ride = create_ride()
        response = self.put(url=self.get_url_for_passenger(passenger),
                            body_dict=self.get_passenger_request_json(passenger),
                            user=user)
        self.assertEqual(response.status_code, 403)

    def test_driver_cannot_change_other_passengers_ride(self):
        ride = create_ride()
        passenger = create_passenger_user(create_ride())
        passenger.ride = ride
        response = self.put(url=self.get_url_for_passenger(passenger),
                            body_dict=self.get_passenger_request_json(passenger),
                            user=ride.driver.user)
        self.assertEqual(response.status_code, 403)

    def test_passenger_can_delete_himself(self):
        passenger1 = create_passenger_user(create_ride())
        passenger2 = create_passenger_user(create_ride())
        self.delete(url=self.get_url_for_passenger(passenger1),
                    user=passenger1.travel_user.user)
        self.assert_get(url=self.get_url_for_passengers(),
                        expected=[self.passenger_to_response_dict(passenger2)],
                        user=passenger2.travel_user.user)

    def test_driver_can_delete_his_passenger(self):
        ride = create_ride()
        passenger = create_passenger_user(ride)
        self.delete(url=self.get_url_for_passenger(passenger),
                    user=ride.driver.user)
        self.assert_get(url=self.get_url_for_passengers(),
                        expected=[],
                        user=ride.driver.user)

    def test_user_cannot_delete_other_passenger(self):
        user = create_user()
        passenger = create_passenger_user(create_ride())
        response = self.delete(url=self.get_url_for_passenger(passenger),
                               user=user)
        self.assertEqual(response.status_code, 403)

    def test_driver_cannot_delete_others_passenger(self):
        ride = create_ride()
        passenger = create_passenger_user(create_ride())
        response = self.delete(url=self.get_url_for_passenger(passenger),
                               user=ride.driver.user)
        self.assertEqual(response.status_code, 403)
