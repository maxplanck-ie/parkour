from django import forms
from .models import Library


class LibraryForm(forms.ModelForm):
    class Meta:
        model = Library
        fields = (
            'name',
            'library_protocol',
            'library_type',
            'enrichment_cycles',
            'organism',
            'index_type',
            'index_reads',
            'index_i7',
            'index_i5',
            'equal_representation_nucleotides',
            'dna_dissolved_in',
            'concentration',
            'concentration_determined_by',
            'sample_volume',
            'mean_fragment_size',
            'qpcr_result',
            'read_length',
            'sequencing_depth',
            'comments',
        )
