from django.apps import AppConfig


class RequestConfig(AppConfig):
    name = 'request'

    def ready(self):
        import request.signals
