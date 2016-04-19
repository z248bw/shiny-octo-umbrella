import json

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from travel.tests import create_user


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
        user = self.admin if user is None else user
        self.client.force_authenticate(user=user)
        return self.client.get(path=url, user=user)

    def assert_get_has_no_permission(self, url, user):
        self.assertEqual(self.get(url=url, user=user).status_code, 403)

    def get_url_for_users(self):
        return '/rest/users/'

    def get_url_for_user(self, user):
        return '/rest/users/' + str(user.pk) + '/'

    def test_get_users_with_admin(self):
        user2 = create_user()
        expected = [{'pk': self.admin.pk,
                     'username': self.admin.username,
                     'first_name': self.admin.first_name,
                     'last_name': self.admin.last_name,
                     'email': self.admin.email},
                    {'pk': user2.pk,
                     'username': user2.username,
                     'first_name': user2.first_name,
                     'last_name': user2.last_name,
                     'email': user2.email}
                    ]
        self.assert_get(url=self.get_url_for_users(), expected=expected)

    def test_get_user_with_admin(self):
        create_user()
        expected = {'pk': self.admin.pk,
                    'username': self.admin.username,
                    'first_name': self.admin.first_name,
                    'last_name': self.admin.last_name,
                    'email': self.admin.email}
        self.assert_get(url=self.get_url_for_user(self.admin), expected=expected)

    def test_get_users_without_permission(self):
        user = create_user()
        self.assert_get_has_no_permission(url=self.get_url_for_users(), user=user)

    def test_get_other_user(self):
        user = create_user()
        self.assert_get_has_no_permission(url=self.get_url_for_user(self.admin), user=user)

    def test_get_own_user(self):
        user = create_user()
        expected = {'pk': user.pk,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email}
        self.assert_get(url=self.get_url_for_user(user), expected=expected, user=user)
