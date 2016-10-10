from django.contrib import admin
from library.models import LibraryProtocol, LibraryType, Organism, IndexType, \
	IndexI5, IndexI7, ConcentrationMethod, SequencingRunCondition, Library, \
	NucleicAcidType, SampleProtocol, RNAQuality, Sample


@admin.register(LibraryProtocol)
class LibraryProtocolAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        # After saving new library protocol add it 
        # to the list of protocols of library type 'Other'
        obj.save()
        other_library_type = LibraryType.objects.get(name='Other')
        other_library_type.library_protocol.add(obj)
        other_library_type.save()


@admin.register(
	LibraryType, Organism, IndexType, ConcentrationMethod,
	SequencingRunCondition, NucleicAcidType, RNAQuality)
class FormFieldsAdmin(admin.ModelAdmin):
    pass


@admin.register(IndexI5, IndexI7)
class IndexAdmin(admin.ModelAdmin):
    list_display = ('index_id', 'index', 'index_type',)
    list_filter = ('index_type',)
    search_fields = ('index_id', 'index', 'index_type',)


@admin.register(SampleProtocol)
class SampleProtocolAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'provider', 'typical_application',)
    list_filter = ('type', 'provider', 'typical_application',)
    search_fields = ('name', 'type', 'provider', 'typical_application',)


@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    exclude = ('files', 'is_in_request',)


@admin.register(Sample)
class SampleAdmin(admin.ModelAdmin):
    exclude = ('files', 'is_in_request',)
