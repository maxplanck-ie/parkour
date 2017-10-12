from django.db.models import Q
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import (ModelSerializer, ListSerializer,
                                        SerializerMethodField, IntegerField,
                                        CharField)

from library.models import Library
from sample.models import Sample
from index_generator.models import Pool
from .models import Sequencer, Flowcell, Lane


class SequencerSerializer(ModelSerializer):

    class Meta:
        model = Sequencer
        fields = ('id', 'name', 'lanes', 'lane_capacity',)


class LaneListSerializer(ListSerializer):

    def update(self, instance, validated_data):
        # Maps for id->instance and id->data item.
        object_mapping = {obj.pk: obj for obj in instance}
        data_mapping = {item['pk']: item for item in validated_data}

        # Perform updates
        ret = []
        for obj_id, data in data_mapping.items():
            obj = object_mapping.get(obj_id, None)
            if obj is not None:
                if 'quality_check' in data.keys() and \
                        data['quality_check'] == 'completed':
                    obj.completed = True
                ret.append(self.child.update(obj, data))
        return ret


class LaneSerializer(ModelSerializer):
    pk = IntegerField()
    flowcell = SerializerMethodField()
    flowcell_id = SerializerMethodField()
    pool_name = SerializerMethodField()
    read_length_name = SerializerMethodField()
    index_i7_show = SerializerMethodField()
    index_i5_show = SerializerMethodField()
    sequencer = SerializerMethodField()
    sequencer_name = SerializerMethodField()
    equal_representation = SerializerMethodField()
    create_time = SerializerMethodField()
    quality_check = CharField(required=False)

    class Meta:
        list_serializer_class = LaneListSerializer
        model = Lane
        fields = ('pk', 'name', 'flowcell', 'flowcell_id', 'pool', 'pool_name',
                  'read_length_name', 'index_i7_show', 'index_i5_show',
                  'sequencer', 'sequencer_name', 'equal_representation',
                  'loading_concentration', 'phix', 'create_time',
                  'quality_check',)
        extra_kwargs = {
            'name': {'required': False},
            'pool': {'required': False},
        }

    def get_flowcell(self, obj):
        return obj.flowcell.get().pk

    def get_flowcell_id(self, obj):
        return obj.flowcell.get().flowcell_id

    def get_pool_name(self, obj):
        return obj.pool.name

    def get_read_length_name(self, obj):
        records = obj.pool.libraries.all() or obj.pool.samples.all()
        return records[0].read_length.name

    def get_index_i7_show(self, obj):
        return None

    def get_index_i5_show(self, obj):
        return None

    def get_sequencer(self, obj):
        return obj.flowcell.get().sequencer.pk

    def get_sequencer_name(self, obj):
        return obj.flowcell.get().sequencer.name

    def get_equal_representation(self, obj):
        libraries = self._get_libraries(obj)
        samples = self._get_samples(obj)

        eqn_libraries = list(libraries.values_list(
            'equal_representation_nucleotides', flat=True)).count(True)

        eqn_samples = list(samples.values_list(
            'equal_representation_nucleotides', flat=True)).count(True)

        return libraries.count() + samples.count() == \
            eqn_libraries + eqn_samples

    def get_create_time(self, obj):
        return obj.flowcell.get().create_time

    def _get_libraries(self, obj):
        return obj.pool.libraries.filter(~Q(status=-1))

    def _get_samples(self, obj):
        return obj.pool.samples.filter(~Q(status=-1))


class FlowcellSerializer(ModelSerializer):

    class Meta:
        model = Flowcell
        fields = ('flowcell_id', 'sequencer',)

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)

        lanes = data.get('lanes', [])
        if not lanes:
            raise ValidationError({
                'lanes': ['No lanes are provided.'],
            })

        # Check if all lanes are loaded
        sequencer = internal_value.get('sequencer')
        if len(lanes) != sequencer.lanes:
            raise ValidationError({
                'lanes': ['All lanes must be loaded.'],
            })

        internal_value.update({'lanes': lanes})

        return internal_value

    def create(self, validated_data):
        lanes = validated_data.pop('lanes')
        instance = super().create(validated_data)

        # Create Lane objects and add them to the flowcell
        lane_ids = []
        for lane_dict in lanes:
            lane = Lane(name=lane_dict['name'], pool_id=lane_dict['pool_id'])
            lane.save()
            lane_ids.append(lane.pk)
        instance.lanes.add(*lane_ids)

        pool_ids = list(Lane.objects.all().filter(pk__in=lane_ids).values_list(
            'pool', flat=True,
        ).distinct())
        pools = Pool.objects.all().filter(pk__in=pool_ids)

        # After creating a flowcell, update all pool's libraries' and
        # samples' statuses if the pool is fully loaded
        for pool in pools:
            if pool.loaded == pool.size.multiplier:
                pool.libraries.all().filter(status=4).update(status=5)
                pool.samples.all().filter(status=4).update(status=5)

        return instance


class PoolSerializer(ModelSerializer):
    read_length = SerializerMethodField()
    read_length_name = SerializerMethodField()
    pool_size_id = SerializerMethodField()
    pool_size = SerializerMethodField()
    ready = SerializerMethodField()

    class Meta:
        model = Pool
        fields = ('pk', 'name', 'read_length', 'read_length_name',
                  'pool_size_id', 'pool_size', 'loaded', 'ready',)

    def get_read_length(self, obj):
        records = obj.libraries.all() or obj.samples.all()
        if records.count() > 0:
            return records[0].read_length.pk
        return None

    def get_read_length_name(self, obj):
        # TODO: remove the field from the result?
        records = obj.libraries.all() or obj.samples.all()
        if records.count() > 0:
            return records[0].read_length.name
        return None

    def get_pool_size_id(self, obj):
        return obj.size.pk

    def get_pool_size(self, obj):
        return obj.size.multiplier

    def get_ready(self, obj):
        libraries_statuses = obj.libraries.all().filter(
            ~Q(status=-1)).values_list('status', flat=True)
        samples_statuses = obj.samples.all().filter(
            ~Q(status=-1)).values_list('status', flat=True)
        statuses = list(libraries_statuses) + list(samples_statuses)
        return statuses.count(4) == len(statuses)


class PoolInfoBaseSerializer(ModelSerializer):
    record_type = SerializerMethodField()
    protocol_name = SerializerMethodField()
    request_name = SerializerMethodField()

    class Meta:
        fields = ('name', 'barcode', 'record_type', 'protocol_name',
                  'request_name',)

    def get_record_type(self, obj):
        return obj.__class__.__name__

    def get_protocol_name(self, obj):
        return obj.library_protocol.name

    def get_request_name(self, obj):
        return obj.request.get().name


class PoolInfoLibrarySerializer(PoolInfoBaseSerializer):

    class Meta(PoolInfoBaseSerializer.Meta):
        model = Library
        fields = PoolInfoBaseSerializer.Meta.fields


class PoolInfoSampleSerializer(PoolInfoBaseSerializer):

    class Meta(PoolInfoBaseSerializer.Meta):
        model = Sample
        fields = PoolInfoBaseSerializer.Meta.fields + ('is_converted',)


class PoolInfoSerializer(ModelSerializer):
    libraries = SerializerMethodField()
    samples = SerializerMethodField()

    class Meta:
        model = Pool
        fields = ('id', 'name', 'libraries', 'samples',)

    def get_libraries(self, obj):
        queryset = obj.libraries.filter(~Q(status=-1))
        serializer = PoolInfoLibrarySerializer(queryset, many=True)
        return serializer.data

    def get_samples(self, obj):
        queryset = obj.samples.filter(~Q(status=-1))
        serializer = PoolInfoSampleSerializer(queryset, many=True)
        return serializer.data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        libraries = data.pop('libraries')
        samples = data.pop('samples')
        records = libraries + samples

        data.update({
            'records': sorted(records, key=lambda x: x['barcode'][3:])
        })

        return data
