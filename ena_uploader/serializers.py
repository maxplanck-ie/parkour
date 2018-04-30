from django.apps import apps

from rest_framework.serializers import ModelSerializer, SerializerMethodField


Request = apps.get_model('request', 'Request')
Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')


class BaseSerializer(ModelSerializer):
    insert_size = SerializerMethodField()
    library_name = SerializerMethodField()
    library_type = SerializerMethodField()
    library_strategy = SerializerMethodField()
    library_construction_protocol = SerializerMethodField()

    class Meta:
        fields = (
            'pk',
            'barcode',
            'is_converted',
            'insert_size',
            'library_name',
            'library_strategy',
            'library_construction_protocol',
        )

    def get_library_name(self, obj):
        return obj.name

    def get_library_strategy(self, obj):
        return obj.library_type.name

    def get_library_construction_protocol(self, obj):
        return obj.library_protocol.name


class LibrarySerializer(BaseSerializer):
    is_converted = SerializerMethodField()

    class Meta:
        model = Library
        fields = BaseSerializer.Meta.fields

    def get_is_coverted(self, obj):
        return False

    def get_insert_size(self, obj):
        return obj.mean_fragment_size


class SampleSerializer(BaseSerializer):
    class Meta:
        model = Sample
        fields = BaseSerializer.Meta.fields

    def get_insert_size(self, obj):
        try:
            return obj.librarypreparation.mean_fragment_size
        except Exception:
            return None


class ENASerializer(ModelSerializer):
    libraries = SampleSerializer(many=True)
    samples = SampleSerializer(many=True)

    class Meta:
        model = Request
        fields = ('description', 'libraries', 'samples',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        result = []

        if not any(data['libraries']) and not any(data['samples']):
            return []

        flowcell = instance.flowcell.only('sequencer__name').first()
        sequencer_name = flowcell.sequencer.name if flowcell else None

        for type in ['libraries', 'samples']:
            result.extend(list(map(
                lambda x: {**{
                    'design_description': data['description'],
                    'instrument_model': sequencer_name,
                }, **x},
                data.pop(type),
            )))

        return {'result': result}
