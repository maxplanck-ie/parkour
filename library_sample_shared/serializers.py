from rest_framework.serializers import ModelSerializer, SerializerMethodField

from .models import Organism, IndexType, LibraryProtocol, LibraryType


class OrganismSerializer(ModelSerializer):

    class Meta:
        model = Organism
        fields = ('id', 'name')


class IndexTypeSerializer(ModelSerializer):
    index_reads = SerializerMethodField()
    is_dual = SerializerMethodField()
    index_length = SerializerMethodField()

    class Meta:
        model = IndexType
        fields = ('id', 'name', 'index_reads', 'is_dual', 'index_length')

    def get_index_reads(self, obj):
        return [obj.is_index_i7, obj.is_index_i5].count(True)

    def get_is_dual(self, obj):
        return obj.is_index_i7 and obj.is_index_i5

    def get_index_length(self, obj):
        return int(obj.get_index_length_display())


class LibraryProtocolSerializer(ModelSerializer):

    class Meta:
        model = LibraryProtocol
        fields = '__all__'


class LibraryTypeSerializer(ModelSerializer):
    # library_protocol = SerializerMethodField()
    protocol = SerializerMethodField()

    class Meta:
        model = LibraryType
        # fields = ('id', 'name', 'library_protocol')
        fields = ('id', 'name', 'protocol')

    # def get_library_protocol(self, obj):
    def get_protocol(self, obj):
        return LibraryType.objects.filter(pk=obj.pk).values_list(
            'library_protocol__id', flat=True)
