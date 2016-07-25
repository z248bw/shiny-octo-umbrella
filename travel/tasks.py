from __future__ import absolute_import

from celery import shared_task


# Start by 'celery -A wedding beat'
@shared_task
def hello():
    print('hello')
