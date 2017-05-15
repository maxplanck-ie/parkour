from django.contrib import admin
from .models import Pooling


@admin.register(Pooling)
class PoolingAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': (
                'concentration_c1',
                'concentration_c2',
                'sample_volume',
                'buffer_volume',
                'percentage_library',
                'volume_to_pool',
            ),
        }),
    )
