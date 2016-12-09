from django.contrib import admin
from .models import SampleProtocol, NucleicAcidType, Sample


@admin.register(SampleProtocol)
class SampleProtocolAdmin(admin.ModelAdmin):
    pass


@admin.register(NucleicAcidType)
class NucleicAcidTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(Sample)
class SampleAdmin(admin.ModelAdmin):
    pass
