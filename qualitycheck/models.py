from django.db import models
from django.forms import ModelForm
from library.models import Library, Sample


class IncomingLibraryForm(ModelForm):
    class Meta:
        model = Library
        fields = (
            'dilution_factor',
            'concentration_facility',
            'concentration_determined_by_facility',
            'sample_volume_facility',
            'amount_facility',
            'qpcr_result_facility',
            'size_distribution_facility',
            'comments_facility',
            'qc_result',
        )


class IncomingSampleForm(ModelForm):
    class Meta:
        model = Sample
        fields = (
            'dilution_factor',
            'concentration_facility',
            'concentration_determined_by_facility',
            'sample_volume_facility',
            'amount_facility',
            'rna_quality_facility',
            'size_distribution_facility',
            'comments_facility',
            'qc_result',
        )
