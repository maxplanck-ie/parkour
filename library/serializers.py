import random

from rest_framework.serializers import (
    ModelSerializer,
    SerializerMethodField,
    IntegerField,
)

from library_sample_shared.serializers import LibrarySampleBaseSerializer
from sample.serializers import SampleSerializer

from library.models import Library
from request.models import Request


class LibrarySerializer(LibrarySampleBaseSerializer):
    pk = IntegerField(required=False)
    index_type_name = SerializerMethodField()
    record_type = SerializerMethodField()

    class Meta(LibrarySampleBaseSerializer.Meta):
        model = Library
        fields = LibrarySampleBaseSerializer.Meta.fields + \
            ('pk', 'record_type', 'index_type', 'index_type_name',
             'index_reads', 'index_i7', 'index_i5', 'mean_fragment_size',
             'qpcr_result',)

    def get_record_type(self, obj):
        return 'Library'

    def get_index_type_name(self, obj):
        return obj.index_type.name


class RequestParentNodeSerializer(ModelSerializer):
    id = SerializerMethodField()
    name = SerializerMethodField()
    cls = SerializerMethodField()
    leaf = SerializerMethodField()

    class Meta:
        model = Request
        fields = ('id', 'name', 'cls', 'leaf',)

    def get_id(self, obj):
        return obj.pk

    def get_name(self, obj):
        num_total = obj.libraries.count() + obj.samples.count()
        sum_total = \
            sum(obj.libraries.values_list('sequencing_depth', flat=True)) + \
            sum(obj.samples.values_list('sequencing_depth', flat=True))

        name = f'<strong>Request: {obj.name}</strong> ' + \
               f'(# of Libraries/Samples: {num_total}, ' + \
               f'Total Sequencing Depth: {sum_total} M)'

        return name

    def get_cls(self, obj):
        return 'parent-node-name'

    def get_leaf(self, obj):
        return False


class LibraryChildNodeSerializer(LibrarySerializer):
    id = SerializerMethodField()
    leaf = SerializerMethodField()

    class Meta(LibrarySerializer.Meta):
        fields = LibrarySerializer.Meta.fields + ('id', 'leaf',)

    def get_id(self, obj):
        # Each leaf node needs a unique id
        return obj.pk + obj.request.get().pk + random.randint(0, 1000)

    def get_leaf(self, obj):
        return True


class SampleChildNodeSerializer(SampleSerializer):
    id = SerializerMethodField()
    leaf = SerializerMethodField()

    class Meta(SampleSerializer.Meta):
        fields = SampleSerializer.Meta.fields + ('id', 'leaf',)

    def get_id(self, obj):
        # Each leaf node needs a unique id
        return obj.pk + obj.request.get().pk + random.randint(0, 1000)

    def get_leaf(self, obj):
        return True


class RequestChildrenNodesSerializer(ModelSerializer):
    libraries = LibraryChildNodeSerializer(many=True)
    samples = SampleChildNodeSerializer(many=True)

    class Meta:
        model = Request
        fields = ('libraries', 'samples',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        libraries = data.pop('libraries')
        samples = data.pop('samples')
        merged_data = libraries + samples
        return {
            'children': sorted(merged_data, key=lambda x: x['barcode'][3:])
        }
