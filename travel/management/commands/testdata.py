from django.core.management import BaseCommand

from travel.fixtures.fixture import TestFixture


class Command(BaseCommand):
    help = 'Manage test data for the travel application'

    def add_arguments(self, parser):
        parser.add_argument('-d', '--delete',
                            action='store_true',
                            dest='delete',
                            default=False,
                            help='Delete all data from db except of the admin user')
        parser.add_argument('-u', '--create-user',
                            action='store',
                            nargs='?',
                            type=int,
                            dest='required_user_num',
                            default=0,
                            help='Create users.')
        parser.add_argument('-t', '--create-travel-user',
                            action='store',
                            nargs='?',
                            type=int,
                            dest='required_travel_user_num',
                            default=0,
                            help='Create travel users.')

    def handle(self, *args, **options):
        if options['delete']:
            self.stdout.write('Start reseting db')
            TestFixture.reset_tables()
            self.stdout.write('Successfully reset db')
        elif options['required_user_num'] > 0:
            self.stdout.write('Starting user creation')
            for user in TestFixture().create_users(num=options['required_user_num']):
                self.stdout.write('Created user: ' + user.username)
            self.stdout.write('Finished user creation')
        elif options['required_travel_user_num'] > 0:
            self.stdout.write('Starting travel user creation')
            for travel_user in TestFixture().create_travel_users(num=options['required_travel_user_num']):
                self.stdout.write('Created travel user: ' + travel_user.user.username)
            self.stdout.write('Finished travel user creation')
        else:
            self.stdout.write('Start creating the test data')
            TestFixture().create_rides()
            self.stdout.write('Successfully created the test data')
