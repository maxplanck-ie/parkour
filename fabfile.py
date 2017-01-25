from fabric.api import env, hosts, lcd, run, local
from fabric.contrib.console import confirm
import pyperclip

import os

env.password = os.environ['FAB_PASS']


def build_client():
    if confirm('Rebuild client?'):
        with lcd('static/main-hub/'):
            local('sencha app build')


def build_docs():
    with lcd('docs/'):
        local('make clean')
        local('make html')
        local('open build/html/index.html')


@hosts(os.environ['FAB_HOST'])
def deploy():
    branch = local('git rev-parse --abbrev-ref HEAD', capture=True)
    # container_id = local('docker ps -q -f name=parkourdocker_parkour_1', capture=True)
    pyperclip.copy('git checkout %s && git pull && '
                   'pip install -r requirements.txt && '
                   'python manage.py migrate && '
                   'python manage.py collectstatic --noinput && exit' % branch)
    run('docker exec -it parkourdocker_parkour_1 /bin/bash')
    run('docker restart parkourdocker_parkour_1')


def coverage(app=''):
    local('coverage run --source="." manage.py test %s -v 2' % app)
    local('rm -rf htmlcov/')
    local('coverage html')
    local('open htmlcov/index.html')
