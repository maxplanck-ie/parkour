from fabric.api import *
import pyperclip


def deploy():
    branch_name = local('git rev-parse --abbrev-ref HEAD', capture=True)
    # container_id = local('docker ps -q -f name=parkourdocker_parkour_1', capture=True)
    # local('docker exec -it %s /bin/bash' % container_id)
    pyperclip.copy('git checkout %s && git pull && '
                   'python manage.py collectstatic --noinput && exit' % branch_name)
    local('docker exec -it parkourdocker_parkour_1 /bin/bash')
    # local('docker update --restart=always %s' % container_id)
    local('docker update --restart=always parkourdocker_parkour_1')
