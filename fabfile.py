from fabric.api import *


branch = local('git rev-parse --abbrev-ref HEAD', capture=True)


def backup_db():
    local('heroku pg:backups capture ')


def deploy_prod():
    local('git push heroku %s:master' % branch)
    local('heroku run python manage.py migrate --app muscat-noir')
