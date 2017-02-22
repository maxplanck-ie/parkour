from django import forms
from .models import Sample


class SampleForm(forms.ModelForm):
    class Meta:
        model = Sample
        fields = (
            'name',
            'nucleic_acid_type',
            'library_protocol',
            'library_type',
            'organism',
            'equal_representation_nucleotides',
            'concentration',
            'concentration_method',
            'amplification_cycles',
            'rna_quality',
            'read_length',
            'sequencing_depth',
            'comments',
        )
