from django.apps import AppConfig


class LibrarySampleSharedConfig(AppConfig):
    name = 'library_sample_shared'
    verbose_name = 'Shared Tables'

    def ready(self):
        import library_sample_shared.signals
