from django.apps import AppConfig


class LibraryConfig(AppConfig):
    name = 'library'

    def ready(self):
        from .signals import create_barcode, delete_library_file_object, \
            delete_library_file
