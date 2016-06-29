#!/bin/bash

JOB=$1
FLAVOR='dev'
BLUE='\033[1;34m'
GREEN='\033[0;32m'
NC='\033[0m'


function set_flavor {
    if [ ! -f dev ]; then
        echo -e "${BLUE} dev file not found running in production flavor ${NC}"
        FLAVOR='prod'
    else
        echo -e "${BLUE}dev file found running in development flavor ${NC}"
    fi
}

function build_app {
    if [ $JOB = 'install' ]; then
        run 'pip install -r requirements.txt'
        run_prod 'export SECRET_KEY=donottellanyoneplz'
        run_dev 'npm install'
    fi
}

function test_app {
    if [ $JOB = 'test' ]; then
        run 'python manage.py test'
        run_prod 'python manage.py check --deploy'
        run_dev './node_modules/karma/bin/karma start --single-run'
    fi
}

function run {
    echo -e "${GREEN} $1 ${NC}"
    $1
    if [ $? -ne 0 ]; then
        exit 1
    fi
}
function run_dev {
    if [ $FLAVOR = 'dev' ]; then
        run "$1"
    fi
}
function run_prod {
    if [ $FLAVOR = 'prod' ]; then
        run "$1"
    fi
}

set_flavor
build_app
test_app
