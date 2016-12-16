from django import forms
from .models import Flowcell


class FlowcellForm(forms.ModelForm):
    class Meta:
        model = Flowcell
        fields = (
            'sequencer',
            'flowcell_id',
        )
