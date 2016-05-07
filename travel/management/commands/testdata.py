from django.core.management import BaseCommand

from travel.fixtures.fixture import TestFixture


class Command(BaseCommand):
    help = 'Manage test data for the travel application'

    def add_arguments(self, parser):
        parser.add_argument('--delete',
                            action='store_true',
                            dest='delete',
                            default=False,
                            help='Delete all data from db except of the admin user')

    def handle(self, *args, **options):
        if options['delete']:
            self.stdout.write('Start reseting db')
            TestFixture.reset_tables()
            self.stdout.write('Successfully reset db')
        else:
            self.stdout.write('Start creating the test data')
            TestFixture().create_rides()
            self.stdout.write('Successfully created the test data')
