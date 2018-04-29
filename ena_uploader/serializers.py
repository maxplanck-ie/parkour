from django.apps import apps

from rest_framework.serializers import ModelSerializer, SerializerMethodField


Request = apps.get_model('request', 'Request')
Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')


class BaseSerializer(ModelSerializer):
    library_protocol = SerializerMethodField()
    library_type = SerializerMethodField()

    class Meta:
        fields = (
            'pk',
            'name',
            'barcode',
            'is_converted',
            'library_protocol',
            'library_type',
            'mean_fragment_size',
        )

    def get_library_protocol(self, obj):
        return obj.library_protocol.name

    def get_library_type(self, obj):
        return obj.library_type.name


class LibrarySerializer(BaseSerializer):
    is_converted = SerializerMethodField()

    class Meta:
        model = Library
        fields = BaseSerializer.Meta.fields

    def get_is_coverted(selg, obj):
        return False


class SampleSerializer(BaseSerializer):
    mean_fragment_size = SerializerMethodField()

    class Meta:
        model = Sample
        fields = BaseSerializer.Meta.fields

    def get_mean_fragment_size(self, obj):
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
                    'description': data['description'],
                    'sequencer': sequencer_name,
                }, **x},
                data.pop(type),
            )))

        return {'result': result}
