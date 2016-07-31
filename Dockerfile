FROM python:3.5-onbuild

ENV DJANGO_CONFIGURATION Docker

CMD honcho start -f Procfile_docker
