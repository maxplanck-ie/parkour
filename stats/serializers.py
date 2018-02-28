from django.apps import apps

from rest_framework.serializers import ModelSerializer, SerializerMethodField

Flowcell = apps.get_model('flowcell', 'Flowcell')


class FlowcellSerializer(ModelSerializer):
    sequencer = SerializerMethodField()

    class Meta:
        model = Flowcell
        fields = ('id', 'flowcell_id', 'create_time', 'sequencer', 'matrix',)

    def get_sequencer(self, obj):
        return obj.sequencer.name

    def to_representation(self, instance):
        data = super().to_representation(instance)
        result = []

        lanes = {}
        for lane in instance.fetched_lanes:
            records = lane.pool.fetched_libraries or lane.pool.fetched_samples
            lanes[lane.name] = {
                'pool': lane.pool.name,
                'loading_concentration': lane.loading_concentration,
                'phix': lane.phix,
                'read_length': records[0].read_length.name,
                'library_preparation': records[0].library_protocol.name,
                'library_type': records[0].library_type.name,
                'request': records[0].fetched_request[0].name,
            }

        num_lanes = len(lanes)
        for item in data['matrix']:
            lane_key = 'Lane 1' if num_lanes == 1 else item['name']
            result.append({**{
                'id': data['id'],
                'flowcell_id': data['flowcell_id'],
                'create_time': data['create_time'],
                'sequencer': data['sequencer'],
                'read_length':
                lanes.get(lane_key, {}).get('read_length', None),
                'library_preparation':
                lanes.get(lane_key, {}).get('library_preparation', None),
                'library_type':
                lanes.get(lane_key, {}).get('library_type', None),
                'loading_concentration':
                lanes.get(lane_key, {}).get('loading_concentration', None),
                'phix': lanes.get(lane_key, {}).get('phix', None),
                'pool': lanes.get(lane_key, {}).get('pool', None),
                'request':
                lanes.get(lane_key, {}).get('request', None),
            }, **item})

        return sorted(result, key=lambda x: x['name'])
