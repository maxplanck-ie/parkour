from django.contrib import admin
from pooling.models import Pool, LibraryPreparation


@admin.register(Pool)
class PoolAdmin(admin.ModelAdmin):
    pass


@admin.register(LibraryPreparation)
class LibraryPreparationAdmin(admin.ModelAdmin):
    pass
