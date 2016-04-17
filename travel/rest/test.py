import json

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from travel.tests import create_user


class MainRestTest(APITestCase):
    def setUp(self):
        self.user = User(username='user',
                         first_name='john',
                         last_name='doe',
                         email='john@doe.com')
        self.user.save()
        self.client.force_authenticate(user=self.user)

    def assert_get(self, url, expected):
        response = self.client.get(path=url, user=self.user)
        actual = json.loads(response.content.decode('utf-8'))
        self.assertEqual(actual, expected)

    def test_get_users(self):
        user2 = create_user()
        expected = [{'pk': self.user.pk,
                     'username': self.user.username,
                     'first_name': self.user.first_name,
                     'last_name': self.user.last_name,
                     'email': self.user.email},
                    {'pk': user2.pk,
                     'username': user2.username,
                     'first_name': user2.first_name,
                     'last_name': user2.last_name,
                     'email': user2.email}
                    ]
        self.assert_get(url='/rest/users/', expected=expected)

    def test_get_user(self):
        create_user()
        expected = {'pk': self.user.pk,
                    'username': self.user.username,
                    'first_name': self.user.first_name,
                    'last_name': self.user.last_name,
                    'email': self.user.email}
        self.assert_get(url='/rest/users/1/', expected=expected)
