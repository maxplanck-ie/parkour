from django.contrib import admin
from flowcell.models import Sequencer


@admin.register(Sequencer)
class SequencerAdmin(admin.ModelAdmin):
    pass
