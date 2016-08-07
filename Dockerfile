FROM python:3.5-onbuild

# this somehow magically sets the postgres env variable
ENV DJANGO_CONFIGURATION Docker

RUN apt-get update && apt-get install -y npm

CMD python make.py --install
