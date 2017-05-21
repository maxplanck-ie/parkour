from django.contrib import admin
from .models import NucleicAcidType, Sample


@admin.register(NucleicAcidType)
class NucleicAcidTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(Sample)
class SampleAdmin(admin.ModelAdmin):
    list_display = ('name', 'barcode', 'library_protocol', 'library_type',
                    'read_length', 'organism',)
    search_fields = ('name', 'barcode',)
    list_filter = ('read_length', 'organism',)
