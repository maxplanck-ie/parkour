from rest_framework.serializers import (ModelSerializer, ListSerializer,
                                        SerializerMethodField)

from .models import (Organism, ReadLength, IndexType, LibraryProtocol,
                     LibraryType, IndexI7, IndexI5, ConcentrationMethod)


class OrganismSerializer(ModelSerializer):

    class Meta:
        model = Organism
        fields = ('id', 'name')


class ReadLengthSerializer(ModelSerializer):

    class Meta:
        model = ReadLength
        fields = ('id', 'name')


class ConcentrationMethodSerializer(ModelSerializer):

    class Meta:
        model = ConcentrationMethod
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


class IndexBaseSerializer(ModelSerializer):
    name = SerializerMethodField()

    class Meta:
        fields = ('id', 'name', 'index', 'index_id',)

    def get_name(self, obj):
        return '%s - %s' % (obj.index_id, obj.index)


class IndexI7Serializer(IndexBaseSerializer):

    class Meta(IndexBaseSerializer.Meta):
        model = IndexI7


class IndexI5Serializer(IndexBaseSerializer):

    class Meta(IndexBaseSerializer.Meta):
        model = IndexI5


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


class LibrarySampleBaseListSerializer(ListSerializer):

    def update(self, instance, validated_data):
        # Maps for id->instance and id->data item.
        object_mapping = {obj.id: obj for obj in instance}
        data_mapping = {item['id']: item for item in validated_data}

        # Perform updates
        ret = []
        for obj_id, data in data_mapping.items():
            obj = object_mapping.get(obj_id, None)
            if obj is not None:
                ret.append(self.child.update(obj, data))
        return ret

    # def delete(self, instance):
    #     pass


class LibrarySampleBaseSerializer(ModelSerializer):
    request_id = SerializerMethodField()
    request_name = SerializerMethodField()
    record_type = SerializerMethodField()
    date = SerializerMethodField()
    library_protocol_name = SerializerMethodField()
    library_type_name = SerializerMethodField()
    concentration_method_name = SerializerMethodField()
    read_length_name = SerializerMethodField()

    class Meta:
        list_serializer_class = LibrarySampleBaseListSerializer
        fields = ('request_id', 'request_name', 'name', 'barcode', 'status',
                  'record_type', 'date', 'library_protocol',
                  'library_protocol_name', 'library_type', 'library_type_name',
                  'organism', 'equal_representation_nucleotides',
                  'concentration', 'concentration_method', 'read_length',
                  'read_length_name', 'sequencing_depth', 'comments',
                  'amplification_cycles',)
        extra_kwargs = {'barcode': {'required': False}}

    def get_request_id(self, obj):
        return obj.request.get().pk

    def get_request_name(self, obj):
        return obj.request.get().name

    def get_record_type(self, obj):
        return obj.get_record_type()

    def get_date(self, obj):
        return obj.create_time

    def get_library_protocol_name(self, obj):
        return obj.library_protocol.name

    def get_library_type_name(self, obj):
        return obj.library_type.name

    def get_concentration_method_name(self, obj):
        return obj.concentration_method.name

    def get_read_length_name(self, obj):
        return obj.read_length.name
