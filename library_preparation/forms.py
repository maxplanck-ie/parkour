from django import forms
from .models import LibraryPreparation


class LibraryPreparationForm(forms.ModelForm):
    class Meta:
        model = LibraryPreparation
        fields = (
            'starting_amount',
            'starting_volume',
            'spike_in_description',
            'spike_in_volume',
            'ul_sample',
            'ul_buffer',
            'pcr_cycles',
            'concentration_library',
            'mean_fragment_size',
            'nM',
        )
