import argparse
import json
import subprocess
import os.path
from time import sleep

import sys

FLAVOR = ''
PROD_FLAVOR = 'prod'
DEV_FLAVOR = 'dev'

with open('makeconfig.json') as config_file:
    MAKECONFIG = json.load(config_file)


def main():
    args = parse_args()
    init_flavor(args)

    if args.build:
        build()
    elif args.test:
        test()
    elif args.install:
        install()
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
    parser.add_argument('-i', '--install',
                        action='store_true',
                        dest='install',
                        default=False,
                        help='bootstrap the application in a docker container')
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


def install():
    print_green('run install')
    iterate_commands('install')
    print_green('successfully finished install')


def iterate_commands(maketype):
    command_type_mapping = {
        'attempt': run_command,
        'execute': execute,
        'dev_execute': dev_execute,
        'prod_execute': prod_execute,
        'must': must
    }
    for instruction in MAKECONFIG[maketype]:
        command_type, command = get_key_value_pair_from_dict(instruction)
        command_type_mapping[command_type](command)


def get_key_value_pair_from_dict(d):
    return list(d.keys())[0], list(d.values())[0]


def build():
    print_green('run build')
    iterate_commands('build')
    print_green('successfully finished build')


def test():
    print_green('run test')
    iterate_commands('test')
    print_green('successfully finished test')


def default():
    sys.stdout.write_red('You should provide at least one target flag! See --help for more information on available flags')


def print_green(t):
    sys.stdout.write('\033[92m' + t + '\033[0m' + '\n')


def print_blue(t):
    sys.stdout.write('\033[94m' + t + '\033[0m' + '\n')


def print_red(t):
    sys.stdout.write('\033[91m' + t + '\033[0m' + '\n')


def execute(command):
    print_blue(command)
    handle_output(run_command(command), command)


def run_command(command):
    p = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
    for line in iter(p.stdout.readline, b''):
        sys.stdout.write(line.decode('utf-8'))
    return p


def must(command):
    print_blue('Attempting: ' + command)
    while run_command(command).wait():
        print_blue(command + 'failed. Retry in 5 secs.')
        sleep(5)


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
