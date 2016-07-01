import dj_database_url


ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': dj_database_url.config()
}
