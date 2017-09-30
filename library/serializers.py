from rest_framework.serializers import SerializerMethodField, IntegerField

from library_sample_shared.serializers import LibrarySampleBaseSerializer
from library.models import Library


class LibrarySerializer(LibrarySampleBaseSerializer):
    id = IntegerField(required=False)
    library_id = SerializerMethodField()
    index_type_name = SerializerMethodField()

    class Meta(LibrarySampleBaseSerializer.Meta):
        model = Library
        fields = LibrarySampleBaseSerializer.Meta.fields + \
            ('id', 'library_id', 'index_type', 'index_type_name',
             'index_reads', 'index_i7', 'index_i5', 'mean_fragment_size',
             'qpcr_result',)

    def get_library_id(self, obj):
        return obj.pk

    def get_index_type_name(self, obj):
        return obj.index_type.name
