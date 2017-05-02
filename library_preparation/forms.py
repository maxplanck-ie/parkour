from django import forms
from .models import LibraryPreparation


class LibraryPreparationForm(forms.ModelForm):
    class Meta:
        model = LibraryPreparation
        exclude = ['sample']
