from django.contrib import admin
from django_admin_listfilter_dropdown.filters import RelatedDropdownFilter

from .models import (
    Organism,
    ConcentrationMethod,
    ReadLength,
    IndexType,
    IndexI7,
    IndexI5,
    LibraryProtocol,
    LibraryType,
)
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
    list_display = ('name', 'index_length', 'dual',)
    filter_horizontal = ('indices_i7', 'indices_i5',)

    fieldsets = (
        (None, {
            'fields': ('name', 'index_length', 'is_index_i7', 'is_index_i5',
                       'indices_i7', 'indices_i5',),
        }),
    )

    def dual(self, obj):
        return obj.is_index_i7 and obj.is_index_i5
    dual.boolean = True


@admin.register(IndexI7)
class IndexI7Admin(admin.ModelAdmin):
    list_display = ('index_id', 'index', 'type',)
    search_fields = ('index_id', 'index', 'index_type__name',)
    list_filter = (('index_type', RelatedDropdownFilter),)


@admin.register(IndexI5)
class IndexI5Admin(admin.ModelAdmin):
    list_display = ('index_id', 'index', 'type',)
    search_fields = ('index_id', 'index', 'index_type__name',)
    list_filter = (('index_type', RelatedDropdownFilter),)


@admin.register(LibraryProtocol)
class LibraryProtocolAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'provider', 'catalog',
                    'typical_application',)
    search_fields = ('name', 'provider', 'catalog', 'typical_application',)
    list_filter = ('type',)


@admin.register(LibraryType)
class LibraryTypeAdmin(admin.ModelAdmin):
    filter_horizontal = ('library_protocol',)
