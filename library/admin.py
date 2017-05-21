from django.contrib import admin
from .models import Library


@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    list_display = ('name', 'barcode', 'library_protocol', 'library_type',
                    'index_type', 'read_length', 'organism',)
    search_fields = ('name', 'barcode',)
    list_filter = ('index_type', 'read_length', 'organism',)
