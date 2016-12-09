from django.apps import AppConfig


class LibraryPreparationConfig(AppConfig):
    name = 'library_preparation'
    verbose_name = 'Library Preparation'

    def ready(self):
        from .signals import delete_file
