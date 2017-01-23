from django.apps import AppConfig


class FlowcellConfig(AppConfig):
    name = 'flowcell'

    def ready(self):
        import flowcell.signals
