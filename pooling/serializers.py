from django.db.models import Q
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import (
    ModelSerializer,
    ListSerializer,
    SerializerMethodField,
    IntegerField,
    CharField,
)

from library_sample_shared.models import IndexType
from library.models import Library
from sample.models import Sample
from library_preparation.models import LibraryPreparation

from .models import Pooling


class BaseListSerializer(ListSerializer):
    def update(self, instance, validated_data):
        # Maps for id->instance and id->data item.
        object_mapping = {obj.pk: obj for obj in instance}
        data_mapping = {item['pk']: item for item in validated_data}

        # Perform updates
        ret = []
        for obj_id, data in data_mapping.items():
            obj = object_mapping.get(obj_id, None)
            if obj is not None:
                if 'quality_check' in data.keys():
                    if data['quality_check'] == 'passed':
                        obj.status = 4
                    elif data['quality_check'] == 'failed':
                        obj.status = -1
                ret.append(self.child.update(obj, data))
        return ret


class PoolingBaseSerializer(ModelSerializer):
    pk = IntegerField()
    record_type = SerializerMethodField()
    request = SerializerMethodField()
    request_name = SerializerMethodField()
    pool = SerializerMethodField()
    pool_name = SerializerMethodField()
    pool_size = SerializerMethodField()
    concentration_c1 = SerializerMethodField()
    concentration_library = SerializerMethodField()
    mean_fragment_size = SerializerMethodField()
    index_i7_id = SerializerMethodField()
    index_i5_id = SerializerMethodField()
    percentage_library = SerializerMethodField()
    create_time = SerializerMethodField()
    quality_check = CharField(required=False)

    class Meta:
        list_serializer_class = BaseListSerializer
        fields = ('pk', 'record_type', 'name', 'status', 'barcode',
                  'request', 'request_name', 'sequencing_depth',
                  'pool', 'pool_name', 'pool_size', 'concentration_c1',
                  'concentration_library', 'mean_fragment_size',
                  'index_i7_id', 'index_i5_id', 'index_i7', 'index_i5',
                  'percentage_library', 'create_time', 'quality_check',)
        extra_kwargs = {
            'name': {'required': False},
            'barcode': {'required': False},
            'sequencing_depth': {'required': False},
        }

    def get_record_type(self, obj):
        return obj.__class__.__name__

    def get_request(self, obj):
        return obj.request.get().pk

    def get_request_name(self, obj):
        return obj.request.get().name

    def get_pool(self, obj):
        return obj.pool.get().pk

    def get_pool_name(self, obj):
        return obj.pool.get().name

    def get_pool_size(self, obj):
        pool_size = obj.pool.get().size
        return '{}x{}'.format(pool_size.multiplier, pool_size.size)

    def get_index_i7_id(self, obj):
        try:
            index_type = IndexType.objects.get(pk=obj.index_type.pk)
            index_i7 = index_type.indices_i7.get(index=obj.index_i7)
            return index_i7.index_id
        except Exception:
            return ''

    def get_index_i5_id(self, obj):
        try:
            index_type = IndexType.objects.get(pk=obj.index_type.pk)
            index_i5 = index_type.indices_i5.get(index=obj.index_i5)
            return index_i5.index_id
        except Exception:
            return ''

    def get_percentage_library(self, obj):
        # TODO: this approach is potentially very slow
        pool = obj.pool.get()
        libraries = pool.libraries.filter(status=2)
        samples = pool.samples.filter(Q(status=3) | Q(status=2) | Q(status=-2))
        sum_total = \
            sum(libraries.values_list('sequencing_depth', flat=True)) + \
            sum(samples.values_list('sequencing_depth', flat=True))
        return '{}%'.format(round(obj.sequencing_depth / sum_total * 100))

    def get_create_time(self, obj):
        # try:
        #     return obj.pooling.create_time
        # except Pooling.DoesNotExist:
        #     return None
        return obj.pooling.create_time

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)

        concentration_c1 = data.get('concentration_c1', None)
        if concentration_c1:
            try:
                internal_value.update({
                    'concentration_c1': float(concentration_c1)
                })
            except ValueError:
                raise ValidationError({
                    'concentration_c1': ['A valid float is required.'],
                })

        return internal_value

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == 'concentration_c1':
                setattr(instance.pooling, attr, value)

        instance.pooling.save()
        instance.save()

        return instance


class PoolingLibrarySerializer(PoolingBaseSerializer):
    class Meta(PoolingBaseSerializer.Meta):
        model = Library

    def get_concentration_c1(self, obj):
        return obj.pooling.concentration_c1

    def get_concentration_library(self, obj):
        return obj.concentration_facility

    def get_mean_fragment_size(self, obj):
        return obj.mean_fragment_size


class PoolingSampleSerializer(PoolingBaseSerializer):
    class Meta(PoolingBaseSerializer.Meta):
        model = Sample
        fields = PoolingBaseSerializer.Meta.fields + ('is_converted',)

    def get_concentration_c1(self, obj):
        try:
            return obj.pooling.concentration_c1
        except Pooling.DoesNotExist:
            return None

    def get_concentration_library(self, obj):
        return obj.librarypreparation.concentration_library

    def get_mean_fragment_size(self, obj):
        try:
            return obj.librarypreparation.mean_fragment_size
        except LibraryPreparation.DoesNotExist:
            return None
