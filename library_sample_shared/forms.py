from django import forms
from .models import IndexType


class IndexTypeForm(forms.ModelForm):
    def clean(self):
        is_index_i7 = self.cleaned_data.get('is_index_i7')
        is_index_i5 = self.cleaned_data.get('is_index_i5')
        indices_i7 = self.cleaned_data.get('indices_i7').all()
        indices_i5 = self.cleaned_data.get('indices_i5').all()

        if not is_index_i7 and not is_index_i5:
            raise forms.ValidationError('Index Type (I7/I5) is not specified.')

        # Don't allow to choose indices, belonging to another Index Type
        for index_i7 in indices_i7:
            try:
                index_type = index_i7.index_type.get()
            except IndexType.DoesNotExist:
                pass
            else:
                if not self.instance.pk or (self.instance.pk and
                                            self.instance.pk != index_type.pk):
                    raise forms.ValidationError('Index %s belongs to %s.' % (
                        index_i7.index_id, index_type.name,
                    ))

        for index_i5 in indices_i5:
            try:
                index_type = index_i5.index_type.get()
            except IndexType.DoesNotExist:
                pass
            else:
                if not self.instance.pk or (self.instance.pk and
                                            self.instance.pk != index_type.pk):
                    raise forms.ValidationError('Index %s belongs to %s.' % (
                        index_i5.index_id, index_type.name,
                    ))
