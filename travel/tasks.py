from __future__ import absolute_import

from celery import shared_task

# Start by 'celery -A wedding beat'
from django.core.mail import send_mail

from travel.models import Notification

NUM_OF_CONCURRENT_NOTIFICATIONS = 10


# TODO wrapper with_oldest_notifications
def send_email_notifications():
    notifications = Notification.objects.all()[0:NUM_OF_CONCURRENT_NOTIFICATIONS]
    for notification in notifications:
        send_mail(subject=notification.title,
                  message=notification.message,
                  from_email='travelmanager@wedding.com',
                  recipient_list=[email_dict['email'] for email_dict in notifications[0].targets.values('email')],
                  fail_silently=False)
    Notification.objects.filter(pk__in=[notification.pk for notification in notifications]).delete()


@shared_task
def trigger_email_notifications():
    send_email_notifications()
