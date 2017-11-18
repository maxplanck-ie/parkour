import logging

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from common.mixins import LibrarySampleMultiEditMixin
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
        library_queryset = Library.objects.filter(
            status=1).exclude(request=None)
        sample_queryset = Sample.objects.filter(
            status=1).exclude(request=None)

        library_serializer = LibrarySerializer(library_queryset, many=True)
        sample_serializer = SampleSerializer(sample_queryset, many=True)

        data = sorted(
            library_serializer.data + sample_serializer.data,
            key=lambda x: x['barcode'][3:],
        )

        return Response(data)
