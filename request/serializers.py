from django.conf import settings
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from .models import Request, FileRequest


class RequestSerializer(ModelSerializer):
    user = SerializerMethodField()
    user_full_name = SerializerMethodField()
    sum_seq_depth = SerializerMethodField()
    restrict_permissions = SerializerMethodField()
    files = SerializerMethodField()
    deep_seq_request_name = SerializerMethodField()
    deep_seq_request_path = SerializerMethodField()

    class Meta:
        model = Request
        fields = ('id', 'name', 'user', 'user_full_name', 'create_time',
                  'description', 'sum_seq_depth', 'restrict_permissions',
                  'files', 'deep_seq_request_name', 'deep_seq_request_path',)

    def get_user(self, obj):
        return obj.user.pk

    def get_user_full_name(self, obj):
        return obj.user.get_full_name()

    def get_sum_seq_depth(self, obj):
        library_depths = obj.libraries.values_list(
            'sequencing_depth', flat=True)
        sample_depths = obj.samples.values_list(
            'sequencing_depth', flat=True)
        return sum(library_depths) + sum(sample_depths)

    def get_restrict_permissions(self, obj):
        """
        Don't allow the users to modify the requests and libraries/samples
        if they have reached status 1 or higher (or failed).
        """
        return True if not obj.user.is_staff and obj.statuses.count(0) == 0 \
            else False

    def get_files(self, obj):
        return [file.pk for file in obj.files.all()]

    def get_deep_seq_request_name(self, obj):
        return obj.deep_seq_request.name.split('/')[-1] \
            if obj.deep_seq_request else ''

    def get_deep_seq_request_path(self, obj):
        return settings.MEDIA_URL + obj.deep_seq_request.name \
            if obj.deep_seq_request else ''


class RequestFileSerializer(ModelSerializer):
    size = SerializerMethodField()
    path = SerializerMethodField()

    class Meta:
        model = FileRequest
        fields = ('id', 'name', 'size', 'path')

    def get_size(self, obj):
        return obj.file.size

    def get_path(self, obj):
        return settings.MEDIA_URL + obj.file.name
