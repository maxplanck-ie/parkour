from django.contrib import admin
from flowcell.models import Sequencer, Flowcell


class LaneInline(admin.TabularInline):
    model = Flowcell.lanes.through
    verbose_name = 'Lane'
    verbose_name_plural = 'Lanes'
    # readonly_fields = ('lane',)
    can_delete = False
    extra = 0

    fields = ('name', 'pool', 'loading_concentration', 'phix', 'completed',)
    readonly_fields = ('name', 'pool', 'loading_concentration', 'phix',
                       'completed',)

    def name(self, instance):
        return instance.lane.name
    name.short_description = 'Name'

    def pool(self, instance):
        return instance.lane.pool.name
    pool.short_description = 'Pool'

    def loading_concentration(self, instance):
        return instance.lane.loading_concentration
    loading_concentration.short_description = 'Loading Concentration'

    def phix(self, instance):
        return instance.lane.phix
    phix.short_description = 'PhiX %'

    def completed(self, instance):
        return instance.lane.completed
    completed.short_description = 'Completed'
    completed.boolean = True

    def has_add_permission(self, request):
        return False


@admin.register(Sequencer)
class SequencerAdmin(admin.ModelAdmin):
    list_display = ('name', 'lanes', 'lane_capacity',)


@admin.register(Flowcell)
class FlowcellAdmin(admin.ModelAdmin):
    list_display = ('flowcell_id', 'sequencer',)
    # search_fields = ('flowcell_id', 'sequencer',)
    list_filter = ('sequencer',)
    exclude = ('lanes', 'requests',)
    inlines = [LaneInline]
