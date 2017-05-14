from django.contrib import admin
from .models import (Organism, ConcentrationMethod, ReadLength, IndexType,
                     IndexI7, IndexI5, LibraryProtocol, LibraryType)
from .forms import IndexTypeForm


@admin.register(Organism)
class OrganismAdmin(admin.ModelAdmin):
    pass


@admin.register(ConcentrationMethod)
class ConcentrationMethodAdmin(admin.ModelAdmin):
    pass


@admin.register(ReadLength)
class ReadLengthAdmin(admin.ModelAdmin):
    pass


@admin.register(IndexType)
class IndexTypeAdmin(admin.ModelAdmin):
    form = IndexTypeForm

    list_display = ('name', 'is_index_i7', 'is_index_i5',)

    fieldsets = (
        (None, {
            'fields': (
                'name',
                'index_length',
                'is_index_i7',
                'is_index_i5',
                'indices_i7',
                'indices_i5',
            ),
        }),
    )

    filter_horizontal = ('indices_i7', 'indices_i5',)


@admin.register(IndexI7)
class IndexI7Admin(admin.ModelAdmin):
    list_display = ('index_id', 'index', 'type',)
    search_fields = ('index_id', 'index',)
    list_filter = ('index_type',)


@admin.register(IndexI5)
class IndexI5Admin(admin.ModelAdmin):
    list_display = ('index_id', 'index', 'type',)
    search_fields = ('index_id', 'index',)
    list_filter = ('index_type',)


@admin.register(LibraryProtocol)
class LibraryProtocolAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'provider', 'catalog',
                    'typical_application',)
    search_fields = ('name', 'provider', 'catalog', 'typical_application',)
    list_filter = ('type', 'provider',)


@admin.register(LibraryType)
class LibraryTypeAdmin(admin.ModelAdmin):
    pass
