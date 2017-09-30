from rest_framework.serializers import SerializerMethodField, IntegerField

from library_sample_shared.serializers import LibrarySampleBaseSerializer
from sample.models import Sample


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
