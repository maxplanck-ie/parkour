import logging

from rest_framework import viewsets

from library_sample_shared.views import LibrarySampleBaseViewSet

from .models import NucleicAcidType
from .serializers import NucleicAcidTypeSerializer, SampleSerializer

logger = logging.getLogger('db')


class NucleicAcidTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """ Get the list of nucleic acid types. """
    serializer_class = NucleicAcidTypeSerializer

    def get_queryset(self):
        return NucleicAcidType.objects.order_by('type', 'name')


class SampleViewSet(LibrarySampleBaseViewSet):
    serializer_class = SampleSerializer
