from django.contrib import admin
from flowcell.models import Sequencer, Flowcell


@admin.register(Sequencer)
class SequencerAdmin(admin.ModelAdmin):
    pass


@admin.register(Flowcell)
class FlowcellAdmin(admin.ModelAdmin):
    pass
