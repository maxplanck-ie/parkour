import io
import csv
import json
from zipfile import ZipFile

from django.apps import apps
from django.http import HttpResponse
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from bioblend.galaxy import GalaxyInstance

# from common.utils import print_sql_queries
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

    # @print_sql_queries
    def retrieve(self, request, pk=None):
        libraries_qs = Library.objects.select_related(
            'organism',
            'library_protocol',
            'library_type',
        ).only(
            'name',
            'barcode',
            'organism__name',
            'mean_fragment_size',
            'library_protocol__name',
            'library_type__name',
        )
        samples_qs = Sample.objects.select_related(
            'organism',
            'library_protocol',
            'library_type',
            'librarypreparation'
        ).only(
            'name',
            'barcode',
            'is_converted',
            'organism__name',
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

    @action(methods=['get'], detail=False)
    def get_galaxy_status(self, request):
        url = request.query_params.get('galaxy_url', '')
        api_key = request.query_params.get('galaxy_api_key', '')
        gi = GalaxyInstance(url=url, key=api_key)

        try:
            gi.histories.get_most_recently_used_history()
            return Response({'success': True})
        except Exception as e:
            return Response({'success': False})

    @action(methods=['post'], detail=True,
            authentication_classes=[CsrfExemptSessionAuthentication])
    def download(self, request, pk=None):
        def getrow(header, item):
            row = []
            for h in header:
                value = item.get(h, '')
                row.append(value if value else 'NA')
            return row

        def getfile(header, data):
            file = io.StringIO()
            writer = csv.writer(file, dialect='excel-tab')
            writer.writerow(header)
            for item in data:
                writer.writerow(getrow(header, item))
            return file

        experiments = json.loads(request.data.get('experiments', '[]'))
        samples = json.loads(request.data.get('samples', '[]'))
        studies = json.loads(request.data.get('studies', '[]'))
        runs = json.loads(request.data.get('runs', '[]'))

        response = HttpResponse(content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename=ENA.zip'

        # Create experiments.tsv
        header = [
            'alias',
            'status',
            'accession',
            'title',
            'study_alias',
            'sample_alias',
            'design_description',
            'library_name',
            'library_strategy',
            'library_source',
            'library_selection',
            'library_layout',
            'insert_size',
            'library_construction_protocol',
            'platform',
            'instrument_model',
            'submission_date',
        ]
        experiments_file = getfile(header, experiments)

        # Create samples.tsv
        header = [
            'alias',
            'status',
            'accession',
            'title',
            'scientific_name',
            'taxon_id',
            'sample_description',
            'submission_date',
        ]
        samples_file = getfile(header, samples)

        # Create studies.tsv
        header = [
            'alias',
            'status',
            'accession',
            'title',
            'study_type',
            'study_abstract',
            'pubmed_id',
            'submission_date',
        ]
        studies_file = getfile(header, studies)

        # Create runs.tsv
        header = [
            'alias',
            'status',
            'accession',
            'experiment_alias',
            'file_name',
            'file_format',
            'file_checksum',
            'submission_date',
        ]
        runs_file = getfile(header, runs)

        # Archive the files
        in_memory = io.BytesIO()
        with ZipFile(in_memory, 'a') as z:
            z.writestr('experiments.tsv', experiments_file.getvalue())
            z.writestr('samples.tsv', samples_file.getvalue())
            z.writestr('studies.tsv', studies_file.getvalue())
            z.writestr('runs.tsv', runs_file.getvalue())

        in_memory.seek(0)
        response.write(in_memory.read())

        return response
