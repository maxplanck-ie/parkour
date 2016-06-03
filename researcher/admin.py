from django.contrib import admin

from researcher.models import Researcher


@admin.register(Researcher)
class ResearcherAdmin(admin.ModelAdmin):
    pass
