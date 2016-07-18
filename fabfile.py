from fabric.api import *
import pyperclip

import os

env.hosts = [os.environ['FAB_HOST']]
env.user = os.environ['FAB_USER']
env.password = os.environ['FAB_PASS']


def deploy():
    branch_name = local('git rev-parse --abbrev-ref HEAD', capture=True)
    # container_id = local('docker ps -q -f name=parkourdocker_parkour_1', capture=True)
    pyperclip.copy('git checkout %s && git pull && '
                   'python manage.py collectstatic --noinput && exit' % branch_name)
    run('docker exec -it parkourdocker_parkour_1 /bin/bash')
    run('docker restart parkourdocker_parkour_1')
