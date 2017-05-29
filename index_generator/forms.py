from django import forms
from library.models import Library
from sample.models import Sample


class LibraryResetForm(forms.ModelForm):
    class Meta:
        model = Library
        fields = (
            'status',
            'dilution_factor',
            'concentration_facility',
            'concentration_method_facility',
            'sample_volume_facility',
            'amount_facility',
            'size_distribution_facility',
            'comments_facility',
            'qpcr_result_facility',
        )


class SampleResetForm(forms.ModelForm):
    class Meta:
        model = Sample
        fields = (
            'status',
            'index_type',
            'dilution_factor',
            'concentration_facility',
            'concentration_method_facility',
            'sample_volume_facility',
            'amount_facility',
            'size_distribution_facility',
            'comments_facility',
            'rna_quality_facility',
        )
