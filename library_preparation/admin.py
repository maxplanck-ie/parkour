from django.contrib import admin
from .models import LibraryPreparation


@admin.register(LibraryPreparation)
class LibraryPreparationAdmin(admin.ModelAdmin):
    pass
