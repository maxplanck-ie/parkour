from django.contrib import admin
from .models import Organism, ConcentrationMethod, ReadLength
from .models import IndexType, IndexI7, IndexI5


@admin.register(Organism)
class OrganismAdmin(admin.ModelAdmin):
    pass


@admin.register(ConcentrationMethod)
class ConcentrationMethodAdmin(admin.ModelAdmin):
    pass


@admin.register(ReadLength)
class ReadLengthAdmin(admin.ModelAdmin):
    pass


@admin.register(IndexType)
class IndexTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(IndexI7)
class IndexI7Admin(admin.ModelAdmin):
    pass


@admin.register(IndexI5)
class IndexI5Admin(admin.ModelAdmin):
    pass
