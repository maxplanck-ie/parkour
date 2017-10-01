from rest_framework.serializers import (ModelSerializer, ListSerializer,
                                        SerializerMethodField)

from library_sample_shared.models import IndexType
from .models import LibraryPreparation


class LibraryPreparationSerializer(ModelSerializer):
    sample_id = SerializerMethodField()
    name = SerializerMethodField()
    barcode = SerializerMethodField()
    request_name = SerializerMethodField()
    pool_name = SerializerMethodField()
    is_converted = SerializerMethodField()
    library_protocol = SerializerMethodField()
    library_protocol_name = SerializerMethodField()
    concentration_sample = SerializerMethodField()
    dilution_factor = SerializerMethodField()
    comments_facility = SerializerMethodField()
    index_i7_id = SerializerMethodField()
    index_i5_id = SerializerMethodField()

    class Meta:
        model = LibraryPreparation
        fields = ('sample_id', 'name', 'barcode', 'request_name', 'pool_name',
                  'is_converted', 'library_protocol', 'library_protocol_name',
                  'concentration_sample', 'starting_amount', 'pcr_cycles',
                  'spike_in_description', 'spike_in_volume', 'dilution_factor',
                  'concentration_library', 'mean_fragment_size', 'comments',
                  'qpcr_result', 'nM', 'comments_facility',
                  'index_i7_id', 'index_i5_id',)

    def get_sample_id(self, obj):
        return obj.sample.pk

    def get_name(self, obj):
        return obj.sample.name

    def get_barcode(self, obj):
        return obj.sample.barcode

    def get_request_name(self, obj):
        return obj.sample.request.get().name

    def get_pool_name(self, obj):
        return obj.sample.pool.get().name

    def get_is_converted(self, obj):
        return obj.sample.is_converted

    def get_library_protocol(self, obj):
        return obj.sample.library_protocol.pk

    def get_library_protocol_name(self, obj):
        return obj.sample.library_protocol.name

    def get_concentration_sample(self, obj):
        return obj.sample.concentration

    def get_dilution_factor(self, obj):
        return obj.sample.dilution_factor

    def get_comments_facility(self, obj):
        return obj.sample.comments_facility

    def get_index_i7_id(self, obj):
        try:
            index_type = IndexType.objects.get(pk=obj.sample.index_type.pk)
            index_i7 = index_type.indices_i7.get(index=obj.sample.index_i7)
            return index_i7.index_id
        except Exception:
            return ''

    def get_index_i5_id(self, obj):
        try:
            index_type = IndexType.objects.get(pk=obj.sample.index_type.pk)
            index_i5 = index_type.indices_i5.get(index=obj.sample.index_i5)
            return index_i5.index_id
        except Exception:
            return ''
