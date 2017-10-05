from django.contrib import admin
from .models import Pooling


@admin.register(Pooling)
class PoolingAdmin(admin.ModelAdmin):
    pass
