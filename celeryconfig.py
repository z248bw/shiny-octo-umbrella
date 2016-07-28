from datetime import timedelta

BROKER_POOL_LIMIT = 1
BROKER_URL = 'redis://172.17.0.2//'

CELERYBEAT_SCHEDULE = {
     'email_every_hour': {
         'task': 'tasks.add',
         'schedule': timedelta(seconds=1),
     },
}

CELERY_TIMEZONE = 'UTC'
