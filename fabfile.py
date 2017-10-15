from fabric.api import env, hosts, lcd, cd, run, local
from fabric.contrib.console import confirm
import pyperclip

import os

env.password = os.environ['FAB_PASS']


def copy_deploy_cmd():
    branch = local('git rev-parse --abbrev-ref HEAD', capture=True)
    pyperclip.copy('git checkout %s && git pull && '
                   'pip3 install -r requirements/prod.txt && '
                   'python3 manage.py migrate && '
                   'python3 manage.py collectstatic --noinput && exit' % branch)


def build_client():
    if confirm('Rebuild client?'):
        with lcd('static/main-hub/'):
            local('sencha app build')


def build_docs():
    with lcd('docs/'):
        local('make clean')
        local('make html')
        # local('open _build/html/index.html')


def coverage(app=''):
    local('coverage run --source="." manage.py test %s -v 2' % app)
    local('rm -rf htmlcov/')
    local('coverage html')
    local('open htmlcov/index.html')


@hosts(os.environ['FAB_HOST'])
def deploy_test():
    copy_deploy_cmd()
    run('docker-compose exec web /bin/bash')
    run('docker-compose restart web')


@hosts(os.environ['PROD_HOST'])
def deploy_prod():
    copy_deploy_cmd()
    with cd('/parkour/data/docker/docker_parkour/'):
        run('pwd')
        run('docker-compose exec web /bin/bash')
        run('docker-compose restart web')
