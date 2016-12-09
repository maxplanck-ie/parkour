from django.apps import AppConfig


class SampleConfig(AppConfig):
    name = 'sample'

    def ready(self):
        from .signals import create_barcode, delete_sample_file_object, \
            delete_sample_file
