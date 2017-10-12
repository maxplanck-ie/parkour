import logging

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from common.mixins import LibrarySampleMultiEditMixin
from request.models import Request
from library.models import Library
from sample.models import Sample
from .serializers import LibrarySerializer, SampleSerializer

logger = logging.getLogger('db')


class IncomingLibrariesViewSet(viewsets.ViewSet, LibrarySampleMultiEditMixin):
    permission_classes = [IsAdminUser]
    library_model = Library
    sample_model = Sample
    library_serializer = LibrarySerializer
    sample_serializer = SampleSerializer

    def list(self, request):
        """ Get the list of all incoming libraries and samples. """
        data = []
        requests_queryset = Request.objects.order_by('-create_time')
        for request_obj in requests_queryset:
            library_serializer = LibrarySerializer(
                request_obj.libraries.filter(status=1), many=True)
            sample_serializer = SampleSerializer(
                request_obj.samples.filter(status=1), many=True)
            records = sorted(library_serializer.data + sample_serializer.data,
                             key=lambda x: x['barcode'][3:])
            data += records
        return Response(data)
