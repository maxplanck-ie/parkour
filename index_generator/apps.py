from django.apps import AppConfig


class IndexGeneratorConfig(AppConfig):
    name = 'index_generator'
    verbose_name = 'Index Generator'

    def ready(self):
        import index_generator.signals
