from django import forms
from .models import Pooling


class PoolingForm(forms.ModelForm):
    class Meta:
        model = Pooling
        fields = (
            'concentration_c1',
            'concentration_c2',
            'sample_volume',
            'buffer_volume',
        )
