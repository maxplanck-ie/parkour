from django.contrib import admin
from library.models import LibraryProtocol, LibraryType, Organism


@admin.register(LibraryProtocol)
class LibraryProtocolAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        # After saving new library protocol add it to the list of protocols of library type 'Other'
        obj.save()
        other_library_type = LibraryType.objects.get(name='Other')
        other_library_type.library_protocol.add(obj)
        other_library_type.save()


@admin.register(LibraryType)
class LibraryTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(Organism)
class OrganismAdmin(admin.ModelAdmin):
    pass
