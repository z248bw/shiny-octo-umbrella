import hashlib
import random
from datetime import datetime

import itertools
from django.contrib.auth.models import User
from django.db.models import Max

from travel.models import Ride, TravelUser, Passenger
from wedding.settings import BASE_DIR


class TestFixture:

    def __init__(self):
        self.last_user_id = 0

    @staticmethod
    def reset_tables():
        Ride.objects.all().delete()
        Passenger.objects.all().delete()
        TravelUser.objects.all().delete()
        User.objects.exclude(is_staff=True).delete()

    def create_rides(self, num=20):
        travel_users = self.create_travel_users(num)
        for _ in range(0, 20):
            ride = Ride(driver=next(travel_users),
                        price=0,
                        num_of_seats=random.randint(1, 6),
                        start_time=datetime.now(),
                        start_location='asd street',
                        is_return=True if random.randint(0, 1) == 0 else False)
            ride.save()
            self.create_passengers(ride)

    def create_travel_users(self, num=20):
        users = self.create_users(num)
        with open('travel_users.txt', 'w') as f:
            for _ in range(0, num):
                user = next(users)
                unique_id = '{}: {} {}'.format(user.pk, user.first_name, user.last_name)
                secret = hashlib.sha1(str.encode(unique_id)).hexdigest()[0:8]
                travel_user = TravelUser(user=user, registration_secret=secret)
                f.write('{} secret:{}\n'.format(unique_id, secret))
                travel_user.save()
                yield travel_user

    def generate_phone_number(self):
        return ''.join([str(random.randint(0, 9)) for _ in range(0, 7)])

    def create_users(self, num=20):
        self.last_user_id = User.objects.all().aggregate(Max('pk'))['pk__max']
        names_iterator = itertools.cycle(self.read_from_file('names.txt'))
        for _ in range(0, num):
            name = next(names_iterator).split()
            first_name = name[0]
            last_name = name[1]
            user = User.objects.create_user(username=first_name + str(self.last_user_id),
                                            password='a',
                                            first_name=first_name,
                                            last_name=last_name,
                                            email=first_name + '@' + 'test.com')
            self.last_user_id += 1
            yield user

    def create_passengers(self, ride):
        num_of_passengers = random.randint(0, ride.num_of_seats)
        travel_users = self.create_travel_users(num_of_passengers)
        for _ in range(0, num_of_passengers):
            Passenger(travel_user=next(travel_users), ride=ride).save()

    def read_from_file(self, filename):
        data = str()
        with open(BASE_DIR + '/travel/fixtures/data/' + filename, 'r') as f:
            data = f.read().split('\n')
        f.closed
        return data
