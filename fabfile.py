from fabric.api import *


def deploy():
    branch_name = local('git rev-parse --abbrev-ref HEAD', capture=True)
    container_id = local('docker ps -q -f name=parkourdocker_parkour_1', capture=True)
    local('docker exec -it %s /bin/bash' % container_id)
    local('git checkout %s && git pull && exit' % branch_name)
    local('docker update --restart=always %s' % container_id)
