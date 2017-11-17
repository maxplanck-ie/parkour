from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Installs the fixture(s) in the database.'

    def handle(self, *args, **options):
        # Load initial data for all apps
        self.load_sample_fixtures()
        self.load_index_generator_fixtures()
        self.load_flowcell_fixtures()

        self.stdout.write(self.style.SUCCESS(
            'Successfully loaded initial data.'))

    def load_sample_fixtures(self):
        call_command('loaddata', 'nucleic_acid_types', app_label='sample')

    def load_index_generator_fixtures(self):
        call_command('loaddata', 'pool_sizes', app_label='index_generator')

    def load_flowcell_fixtures(self):
        call_command('loaddata', 'sequencers', app_label='flowcell')
