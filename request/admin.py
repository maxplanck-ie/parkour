from django.contrib import admin

from request.models import Request


@admin.register(Request)
class ResearcherAdmin(admin.ModelAdmin):
    pass
