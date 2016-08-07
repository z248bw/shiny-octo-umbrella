from __future__ import absolute_import

from celery import shared_task

# Start by 'celery -A wedding beat'


from travel.notifiers.notifiers import EmailNotifier


@shared_task
def trigger_email_notifications():
    EmailNotifier().send_pending_email_notifications()
