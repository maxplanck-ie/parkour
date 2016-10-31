from django.contrib import admin
from pooling.models import Pool


@admin.register(Pool)
class PoolAdmin(admin.ModelAdmin):
    pass
