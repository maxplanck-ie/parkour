from django.contrib import admin

from request.models import Request


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    pass
