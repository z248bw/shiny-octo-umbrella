# Ride sharing application for wedding
Created for one of my relatives wedding and to learn python, django, js, angular and docker.

## Installation
### Heroku
> Please note that the email notification service is not reliable on heroku
> because the application lets only `NUM_OF_CONCURRENT_NOTIFICATIONS`
> notifications to be sent in `EMAIL_COOLDOWN_SECS` seconds, and the
> celery worker sending the emails above that limit requires to start a seperate
> worker process to be started on heroku. By default the application fires up only
> one web process.
1. Set the environmental variables on the management page of the app:
- `SECRET_KEY`
- `REGISTRATION_PASSSPHRASE`
- `EMAIL_HOST` (optional)
- `EMAIL_HOST_USER` (optional)
- `EMAIL_HOST_PASSWORD` (optional)
2. Set the buildpacks in this order:
- nodejs (required for npm and thus angular)
- django
3. Push to the heroku repository

### Locally
1. Install [Docker engine](<https://docs.docker.com/engine/installation/linux/ubuntulinux/>) and [Docker compose](<https://docs.docker.com/compose/install/>).
2. Modify the `wedding/django.env` file to set the required environmental variables.
3. Run:
```
docker-compose build
docker-compose up
```
4. Open `0.0.0.0` in your browser!

##### Uninstall
To stop the application:
```
docker-compose down #this will also delete the containers!
```
To delete the docker image:
```
docker rmi wedding/django
```

### Creating users
If you already know the list of people who might use the application, then it is a good idea to create their users beforehand. You can create inactive users by creating a file called `names.txt` under `wedding/travel/fixtures/data`. An example is already provided.

Then just run:
```
python manage.py testdata --traveluser <number_of_users>
```
The output can be found in `wedding/travel_users.txt`. It contains the last name, first name, id and secret of the user. The secret can be used for registering the user.

If you do not know the users or do not have the means to send them the secret to register, then you can set the `REGISTRATION_PASSPHRASE` constant in `wedding/wedding/settings.py` to be used as the secret for registration. This could be for example some text derived from the invitation letter sent to all of the guests.

## Development
The app is built by a custom script called `make.py` which uses `makeconfig.json` by default. You can view the different build flavors and steps there.
`python make.py --help` will print the help.

Building the app:
```
python make.py build
```

Running the tests in development flavor (dev flavor runs all the linters and coverage tools as well):
```
python make.py --test --flavor dev
```