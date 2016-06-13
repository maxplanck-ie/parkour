from django.contrib import admin

from researcher.models import PrincipalInvestigator, Organization, CostUnit, Researcher


@admin.register(PrincipalInvestigator)
class PrincipalInvestigatorAdmin(admin.ModelAdmin):
    pass


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    pass


@admin.register(CostUnit)
class CostUnitAdmin(admin.ModelAdmin):
    pass


@admin.register(Researcher)
class ResearcherAdmin(admin.ModelAdmin):
    pass
