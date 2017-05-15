from django.contrib import admin
from .models import Pool, PoolSize


@admin.register(Pool)
class PoolAdmin(admin.ModelAdmin):
    pass


@admin.register(PoolSize)
class PoolSizeAdmin(admin.ModelAdmin):
    pass
