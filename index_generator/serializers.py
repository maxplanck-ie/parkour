from django.db.models import Q
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import (
    ModelSerializer,
    ListSerializer,
    SerializerMethodField,
    IntegerField,
)

from request.models import Request
from library.models import Library
from sample.models import Sample
from .models import PoolSize


class PoolSizeSerializer(ModelSerializer):
    name = SerializerMethodField()

    class Meta:
        model = PoolSize
        fields = ('id', 'name', 'multiplier', 'size',)

    def get_name(self, obj):
        return f'{obj.multiplier}x{obj.size}'


class IndexGeneratorListSerializer(ListSerializer):

    def update(self, instance, validated_data):
        # Maps for id->instance and id->data item.
        object_mapping = {obj.pk: obj for obj in instance}
        data_mapping = {item['pk']: item for item in validated_data}

        # Perform updates
        ret = []
        for obj_id, data in data_mapping.items():
            obj = object_mapping.get(obj_id, None)
            if obj is not None:
                ret.append(self.child.update(obj, data))
        return ret


class IndexGeneratorBaseSerializer(ModelSerializer):
    pk = IntegerField()
    record_type = SerializerMethodField()
    request = SerializerMethodField()
    request_name = SerializerMethodField()
    library_protocol_name = SerializerMethodField()
    index_type = SerializerMethodField()

    class Meta:
        list_serializer_class = IndexGeneratorListSerializer
        fields = ('pk', 'record_type', 'name', 'barcode', 'request',
                  'request_name', 'sequencing_depth', 'library_protocol_name',
                  'index_i7_id', 'index_i7', 'index_i5_id', 'index_i5',
                  'index_type', 'read_length',)
        extra_kwargs = {
            'name': {'required': False},
            'barcode': {'required': False},
            'sequencing_depth': {'required': False},
            'read_length': {'required': False},
        }

    def get_record_type(self, obj):
        return obj.__class__.__name__

    def get_request(self, obj):
        return obj.request.get().pk

    def get_request_name(self, obj):
        return obj.request.get().name

    def get_library_protocol_name(self, obj):
        return obj.library_protocol.name

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)

        index_type = data.get('index_type', None)
        if index_type:
            if data['record_type'] == 'Sample':
                internal_value.update({
                    'index_type_id': index_type
                })
            else:
                raise ValidationError({
                    'index_type': ['A sample is required.'],
                })

        return internal_value


class IndexGeneratorLibrarySerializer(IndexGeneratorBaseSerializer):
    class Meta(IndexGeneratorBaseSerializer.Meta):
        model = Library

    def get_index_type(self, obj):
        return obj.index_type.pk


class IndexGeneratorSampleSerializer(IndexGeneratorBaseSerializer):
    class Meta(IndexGeneratorBaseSerializer.Meta):
        model = Sample

    def get_index_type(self, obj):
        return obj.index_type.pk if obj.index_type else None


class IndexGeneratorSerializer(ModelSerializer):
    libraries = SerializerMethodField()
    samples = SerializerMethodField()

    class Meta:
        model = Request
        fields = ('libraries', 'samples',)

    def get_libraries(self, obj):
        queryset = obj.libraries.filter(
            Q(is_pooled=False) & Q(index_i7__isnull=False) &
            (Q(status=2) | Q(status=-2)))
        serializer = IndexGeneratorLibrarySerializer(queryset, many=True)
        return serializer.data

    def get_samples(self, obj):
        queryset = obj.samples.filter(
            Q(is_pooled=False) & (Q(status=2) | Q(status=-2)))
        serializer = IndexGeneratorSampleSerializer(queryset, many=True)
        return serializer.data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return sorted(
            data['libraries'] + data['samples'],
            key=lambda x: x['barcode'][3:],
        )
