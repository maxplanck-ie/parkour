from django.contrib import admin
from .models import Pool, PoolSize


@admin.register(Pool)
class PoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'size',)
    search_fields = ('name', 'size',)
    list_filter = ('size',)


@admin.register(PoolSize)
class PoolSizeAdmin(admin.ModelAdmin):
    pass
