import random
from datetime import datetime

import itertools
from django.contrib.auth.models import User

from travel.models import Ride, TravelUser
from wedding.settings import BASE_DIR


class TestFixture:

    @staticmethod
    def reset_tables():
        Ride.objects.all().delete()
        TravelUser.objects.all().delete()
        User.objects.exclude(username='keli').delete()    #TODO keli

    def create_users(self, num=20):
        first_names_iterator = itertools.cycle(self.read_from_file('first_names.txt'))
        last_names_iterator = itertools.cycle(self.read_from_file('last_names.txt'))
        for i in range(0, num):
            first_name = next(first_names_iterator)
            user = User(username=first_name + str(i),
                        first_name=first_name,
                        last_name=next(last_names_iterator),
                        email=first_name + '@' + 'test.com')
            user.save()
            yield user

    def create_travel_users(self, num=20):
        users = self.create_users(num)
        for i in range(0, num):
            travel_user = TravelUser(user=next(users), phone=self.generate_phone_number())
            travel_user.save()
            yield travel_user

    def generate_phone_number(self):
        return ''.join([str(random.randint(0, 9)) for i in range(0, 7)])

    def create_rides(self, num=20):
        travel_users = self.create_travel_users(num)
        for i in range(0, 20):
            ride = Ride(driver=next(travel_users),
                        price=0,
                        num_of_seats=random.randint(1, 6),
                        start_time=datetime.now(),
                        start_location='asd street')
            ride.save()

    def read_from_file(self, filename):
        data = str()
        with open(BASE_DIR + '/travel/fixtures/data/' + filename, 'r') as f:
            data = f.read().split('\n')
        f.closed
        return data
