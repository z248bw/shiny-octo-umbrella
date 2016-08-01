FROM python:3.5-onbuild

# this somehow magically sets the postgres env variable
ENV DJANGO_CONFIGURATION Docker

CMD honcho start -f Procfile_docker
