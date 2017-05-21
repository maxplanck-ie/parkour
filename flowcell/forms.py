from django import forms
from .models import Flowcell, Lane


class FlowcellForm(forms.ModelForm):
    class Meta:
        model = Flowcell
        fields = (
            'sequencer',
            'flowcell_id',
        )


class LaneForm(forms.ModelForm):
    class Meta:
        model = Lane
        fields = '__all__'
