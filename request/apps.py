from django.apps import AppConfig


class RequestConfig(AppConfig):
    name = 'request'

    def ready(self):
        from .signals import set_request_name, delete_libraries_and_samples
