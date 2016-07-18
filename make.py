import argparse
import subprocess
import os.path

FLAVOR = ''
PROD_FLAVOR = 'prod'
DEV_FLAVOR = 'dev'


def main():
    args = parse_args()
    init_flavor(args)

    if args.build:
        build()
    elif args.test:
        test()
    else:
        default()


def init_flavor(args):
    global FLAVOR
    FLAVOR = PROD_FLAVOR
    if os.path.isfile('dev'):
        FLAVOR = DEV_FLAVOR
    if args.flavor:
        FLAVOR = args.flavor
    print_green(FLAVOR + ' flavor')


def parse_args():
    parser = argparse.ArgumentParser(description='Build and test the application')
    parser.add_argument('-b', '--build',
                        action='store_true',
                        dest='build',
                        default=False,
                        help='build the application')
    parser.add_argument('-t', '--test',
                        action='store_true',
                        dest='test',
                        default=False,
                        help='test the application')
    parser.add_argument('-f', '--flavor',
                        action='store',
                        nargs='?',
                        type=str,
                        dest='flavor',
                        help='specifies the build flavor [dev/prod]')

    return parser.parse_args()


def build():
    print_green('run build')
    execute('pip install -r requirements.txt')
    execute('npm install')
    execute('python manage.py collectstatic --no-input')
    dev_execute('pip install -r dev-requirements.txt')
    dev_execute('flake8')
    print_green('successfully finished build')


def test():
    print_green('run test')
    dev_execute('coverage run manage.py test travel')
    dev_execute('coverage report')
    prod_execute('python manage.py test')
    execute('python manage.py check --deploy')
    dev_execute('./node_modules/karma/bin/karma start --single-run')
    prod_execute('./node_modules/karma/bin/karma start prod.karma.conf.js --single-run')
    print_green('successfully finished test')


def default():
    print_green('run all')
    build()
    test()
    print_green('successfully finished all')


def print_green(t):
    print('\033[92m' + t + '\033[0m')


def print_blue(t):
    print('\033[94m' + t + '\033[0m')


def print_red(t):
    print('\033[91m' + t + '\033[0m')


def execute(command):
    print_blue(command)
    handle_output(run_command(command), command)


def run_command(command):
    p = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
    for line in iter(p.stdout.readline, b''):
        print(line.decode('utf-8'))
    return p


def handle_output(process, command):
    if process.wait() != 0:
        process.stdout.close()
        print_red(command + ' FAILED')
        exit(1)


def prod_execute(command):
    if FLAVOR == PROD_FLAVOR:
        execute(command)


def dev_execute(command):
    if FLAVOR == DEV_FLAVOR:
        execute(command)


if __name__ == '__main__':
    main()
