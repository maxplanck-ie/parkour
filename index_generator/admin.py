from django.contrib import admin
from django_admin_listfilter_dropdown.filters import RelatedDropdownFilter

from .models import Pool, PoolSize


@admin.register(Pool)
class PoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'size',)
    search_fields = ('name', 'size__multiplier', 'size__size',)
    list_filter = (('size', RelatedDropdownFilter),)
    filter_horizontal = ('libraries', 'samples',)


@admin.register(PoolSize)
class PoolSizeAdmin(admin.ModelAdmin):
    pass
