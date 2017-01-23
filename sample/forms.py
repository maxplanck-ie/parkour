from django import forms
from .models import Sample


class SampleForm(forms.ModelForm):
    class Meta:
        model = Sample
        fields = (
            'name',
            'nucleic_acid_type',
            'sample_protocol',
            'organism',
            'equal_representation_nucleotides',
            'dna_dissolved_in',
            'concentration',
            'concentration_method',
            'sample_volume',
            'amplified_cycles',
            'dnase_treatment',
            'rna_quality',
            'rna_spike_in',
            'sample_preparation_protocol',
            'requested_sample_treatment',
            'read_length',
            'sequencing_depth',
            'comments',
        )
