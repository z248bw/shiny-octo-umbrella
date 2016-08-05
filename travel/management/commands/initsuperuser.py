import os

from django.contrib.auth.models import User
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = 'Create superuser from environmental variables. ' + \
           '(DJANGO_SUPERUSER_NAME, DJANGO_SUPERUSER_PASSWORD, DJANGO_SUPERUSER_EMAIL)'

    def handle(self, *args, **options):
        self.stdout.write('Start creating superuser')
        User.objects.create_superuser(username=os.environ.get('DJANGO_SUPERUSER_NAME', 'admin'),
                                      email=os.environ.get('DJANGO_SUPERUSER_EMAIL'),
                                      password=os.environ.get('DJANGO_SUPERUSER_PASSWORD'),
                                      is_staff=True,
                                      is_superuser=True)
        self.stdout.write('Successfully created superuser')
