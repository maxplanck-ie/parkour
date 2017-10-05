from django.contrib import admin
from .models import LibraryPreparation


@admin.register(LibraryPreparation)
class LibraryPreparationAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': (
                'starting_amount',
                'spike_in_description',
                'spike_in_volume',
                'pcr_cycles',
                'concentration_library',
                'mean_fragment_size',
                'nM',
                'qpcr_result',
                'comments',
            ),
        }),
    )
