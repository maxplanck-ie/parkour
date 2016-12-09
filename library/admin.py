from django.contrib import admin
from .models import LibraryProtocol, LibraryType, Library


@admin.register(LibraryProtocol)
class LibraryProtocolAdmin(admin.ModelAdmin):
    pass


@admin.register(LibraryType)
class LibraryTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    pass
