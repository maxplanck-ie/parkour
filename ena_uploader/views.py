import json

from django.apps import apps
# from django.http import HttpResponse
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from common.utils import print_sql_queries
from common.views import CsrfExemptSessionAuthentication
from .serializers import ENASerializer


Request = apps.get_model('request', 'Request')
Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')
Flowcell = apps.get_model('flowcell', 'Flowcell')


class ENAUploaderViewSet(viewsets.ViewSet):
    def list(self, request):
        queryset = Request.objects.all().order_by('-create_time')
        if not request.user.is_staff:
            queryset = queryset.filter(user=request.user)
        data = queryset.values('pk', 'name')
        return Response(data)

    @print_sql_queries
    def retrieve(self, request, pk=None):
        libraries_qs = Library.objects.select_related(
            'library_protocol',
            'library_type',
        ).only(
            'name',
            'barcode',
            'mean_fragment_size',
            'library_protocol__name',
            'library_type__name',
        )
        samples_qs = Sample.objects.select_related(
            'library_protocol',
            'library_type',
            'librarypreparation'
        ).only(
            'name',
            'barcode',
            'is_converted',
            'library_protocol__name',
            'library_type__name',
            'librarypreparation__mean_fragment_size'
        )

        queryset = Request.objects.prefetch_related(
            Prefetch('libraries', queryset=libraries_qs),
            Prefetch('samples', queryset=samples_qs),
        ).only(
            'description',
            'libraries',
            'samples',
        )

        if not request.user.is_staff:
            queryset = queryset.filter(user=request.user)

        req = get_object_or_404(queryset, pk=pk)
        serializer = ENASerializer(req)
        data = serializer.data.get('result')

        data = sorted(data, key=lambda x: x['barcode'][3:])
        return Response(data)

    @action(methods=['post'], detail=True,
            authentication_classes=[CsrfExemptSessionAuthentication])
    def download(self, request, pk=None):
        data = json.loads(request.data.get('data', '[]'))
        return Response(data)
