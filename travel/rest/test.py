import json

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from travel.tests import create_user, create_ride


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
        self.assertEqual(json.loads(response.content.decode('utf-8')), expected)

    def get(self, url, user):
        user = self.login(user)
        return self.client.get(path=url, user=user)

    def login(self, user):
        user = self.admin if user is None else user
        self.client.force_authenticate(user=user)
        return user

    def assert_get_has_no_permission(self, url, user):
        self.assertEqual(self.get(url=url, user=user).status_code, 403)

    def assert_has_create_permission(self, url, user, body_dict):
        self.assert_create_permission(url=url, user=user, body_dict=body_dict, expected=201)

    def assert_create_permission(self, url, user, body_dict, expected):
        self.login(user)
        response = self.client.post(url, body_dict, format='json')
        self.assertEqual(response.status_code, expected)

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
                'start_time': ride.start_time.isoformat() + 'Z', # ECMA 262 date time string specification
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
