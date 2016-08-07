from datetime import timedelta

from wedding import settings

BROKER_POOL_LIMIT = 1
BROKER_URL = 'redis://redis//'

CELERYBEAT_SCHEDULE = {
     'email_every_hour': {
         'task': 'tasks.add',
         'schedule': timedelta(seconds=settings.EMAIL_COOLDOWN_SECS),
     },
}

CELERY_TIMEZONE = 'UTC'
