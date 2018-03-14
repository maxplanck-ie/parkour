import json
import datetime
import itertools

from django.apps import apps
from django.db.models import Q, Prefetch

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework.permissions import IsAdminUser

from common.utils import get_date_range
from .serializers import FlowcellSerializer

Request = apps.get_model('request', 'Request')
Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')
Flowcell = apps.get_model('flowcell', 'Flowcell')
Lane = apps.get_model('flowcell', 'Lane')


class RunStatisticsViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = FlowcellSerializer

    def get_queryset(self):
        request_qs = Request.objects.only('name')

        libraries_qs = Library.objects.filter(~Q(status=-1)).select_related(
            'read_length',
            'library_protocol',
            'library_type',
        ).prefetch_related(
            Prefetch('request', queryset=request_qs, to_attr='fetched_request')
        ).only(
            'read_length__name',
            'library_protocol__name',
            'library_type__name',
        )

        samples_qs = Sample.objects.filter(~Q(status=-1)).select_related(
            'read_length',
            'library_protocol',
            'library_type',
        ).prefetch_related(
            Prefetch('request', queryset=request_qs, to_attr='fetched_request')
        ).only(
            'read_length__name',
            'library_protocol__name',
            'library_type__name',
        )

        lanes_qs = Lane.objects.all().select_related('pool').prefetch_related(
            Prefetch('pool__libraries', queryset=libraries_qs,
                     to_attr='fetched_libraries'),
            Prefetch('pool__samples', queryset=samples_qs,
                     to_attr='fetched_samples'),
        ).only(
            'name',
            'phix',
            'loading_concentration',
            'pool__name',
            'pool__libraries',
            'pool__samples',
        )

        queryset = Flowcell.objects.exclude(
            matrix__isnull=True,
        ).select_related(
            'sequencer',
        ).prefetch_related(
            Prefetch('lanes', queryset=lanes_qs, to_attr='fetched_lanes'),
        ).order_by('-create_time')

        return queryset

    def list(self, request):
        now = datetime.date.today()
        start = request.query_params.get('start', now)
        end = request.query_params.get('end', now)
        start, end = get_date_range(start, end, '%Y-%m-%dT%H:%M:%S')

        queryset = self.filter_queryset(self.get_queryset()).filter(
            create_time__gte=start,
            create_time__lte=end,
        )

        serializer = self.get_serializer(queryset, many=True)
        data = list(itertools.chain(*serializer.data))
        return Response(data)

    @list_route(methods=['post'])
    def upload(self, request):
        flowcell_id = request.data.get('flowcell_id', '')
        matrix = request.data.get('matrix', '')

        try:
            flowcell = Flowcell.objects.get(flowcell_id=flowcell_id)
        except (ValueError, Flowcell.DoesNotExist):
            return Response({
                'success': False,
                'message': f'Flowcell with id "{flowcell_id}" doesn\'t exist.',
            }, 400)

        try:
            matrix = json.loads(matrix)
        except ValueError:
            return Response({
                'success': False,
                'message': 'Invalid matrix data.',
            }, 400)

        flowcell.matrix = matrix
        flowcell.save(update_fields=['matrix'])
        return Response({'success': True})
