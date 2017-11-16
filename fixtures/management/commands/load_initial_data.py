from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Installs the fixtue(s) in the database.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--app',
            action='store',
            dest='app_label',
            default=None,
            help='Only look for fixtures in the specified app.',
        )

    def handle(self, *args, **options):
        app_label = options['app_label']

        if app_label:
            if app_label == 'flowcell':
                self.load_flowcell_fixtures()

        # Load initial data for all apps
        else:
            self.load_flowcell_fixtures()

        self.stdout.write(self.style.SUCCESS(
            'Successfully loaded initial data.'))

    def load_flowcell_fixtures(self):
        call_command('loaddata', 'sequencers', app_label='flowcell')
