from rest_framework.serializers import (ModelSerializer, SerializerMethodField,
                                        IntegerField)

from library_sample_shared.serializers import LibrarySampleBaseSerializer
from sample.models import NucleicAcidType, Sample


class NucleicAcidTypeSerializer(ModelSerializer):

    class Meta:
        model = NucleicAcidType
        fields = ('id', 'name', 'type',)


class SampleSerializer(LibrarySampleBaseSerializer):
    id = IntegerField(required=False)
    sample_id = SerializerMethodField()

    class Meta(LibrarySampleBaseSerializer.Meta):
        model = Sample
        fields = LibrarySampleBaseSerializer.Meta.fields + \
            ('id', 'sample_id', 'nucleic_acid_type', 'rna_quality',
             'is_converted',)

    def get_sample_id(self, obj):
        return obj.pk
