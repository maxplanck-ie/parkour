from django.contrib import admin
from .models import Pool


@admin.register(Pool)
class PoolAdmin(admin.ModelAdmin):
    pass
