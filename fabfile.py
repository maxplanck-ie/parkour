from fabric.api import *


branch = local('git rev-parse --abbrev-ref HEAD', capture=True)


def backup_db():
    local('heroku pg:backups capture ')


def deploy():
    local('git push heroku %s:master' % branch)
    # local('heroku run python manage.py collectstatic --noinput --app muscat-noir')
    local('heroku run python manage.py collectstatic --app muscat-noir')
    local('heroku run python manage.py migrate --app muscat-noir')
