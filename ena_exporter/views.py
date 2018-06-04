import os
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

from common.views import CsrfExemptSessionAuthentication
from .serializers import ENASerializer


Request = apps.get_model('request', 'Request')
Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')


class ENAExporterViewSet(viewsets.ViewSet):
    def list(self, request):
        queryset = Request.objects.all().order_by('-create_time')
        if not request.user.is_staff:
            queryset = queryset.filter(user=request.user)
        data = queryset.values('pk', 'name')
        return Response(data)

    def retrieve(self, request, pk=None):
        libraries_qs = Library.objects.select_related(
            'organism',
            'read_length',
            'library_protocol',
            'library_type',
        ).only(
            'name',
            'status',
            'barcode',
            'comments',
            'organism__taxon_id',
            'organism__scientific_name',
            'read_length__name',
            'mean_fragment_size',
            'library_protocol__name',
            'library_type__name',
        ).filter(status__gte=5)

        samples_qs = Sample.objects.select_related(
            'organism',
            'read_length',
            'library_protocol',
            'library_type',
            'librarypreparation'
        ).only(
            'name',
            'status',
            'barcode',
            'comments',
            'organism__taxon_id',
            'organism__scientific_name',
            'read_length__name',
            'library_protocol__name',
            'library_type__name',
            'librarypreparation__mean_fragment_size'
        ).filter(status__gte=5)

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

    @action(methods=['post'], detail=False)
    def get_galaxy_status(self, request):
        url = request.data.get('galaxy_url', '')
        api_key = request.data.get('galaxy_api_key', '')
        gi = GalaxyInstance(url=url, key=api_key)

        try:
            gi.histories.get_most_recently_used_history()
            return Response({'success': True})
        except Exception as e:
            return Response({'success': False})

    @action(methods=['post'], detail=True,
            authentication_classes=[CsrfExemptSessionAuthentication])
    def download(self, request, pk=None):
        samples = json.loads(request.data.get('samples', '[]'))
        study_abstract = request.data.get('study_abstract', '')
        study_type = request.data.get('study_type', '')

        response = HttpResponse(content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename=ENA.zip'

        experiments_file, samples_file, studies_file, runs_file = \
            self._generate_files(samples, study_abstract, study_type)

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

    @action(methods=['post'], detail=True,
            authentication_classes=[CsrfExemptSessionAuthentication])
    def upload(self, request, pk=None):
        url = request.query_params.get('galaxy_url', '')
        api_key = request.query_params.get('galaxy_api_key', '')
        samples = json.loads(request.data.get('samples', '[]'))
        study_abstract = request.data.get('study_abstract', '')
        study_type = request.data.get('study_type', '')
        zip_file_path = 'ENA.zip'

        gi = GalaxyInstance(url=url, key=api_key)
        try:
            gi.histories.get_most_recently_used_history()
            pass
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Couldn\'t connect to Galaxy.',
            })

        experiments_file, samples_file, studies_file, runs_file = \
            self._generate_files(samples, study_abstract, study_type)

        with ZipFile(zip_file_path, mode='w') as zf:
            zf.writestr('experiments.tsv', experiments_file.getvalue())
            zf.writestr('samples.tsv', samples_file.getvalue())
            zf.writestr('studies.tsv', studies_file.getvalue())
            zf.writestr('runs.tsv', runs_file.getvalue())

        os.remove(zip_file_path)
        return Response({'success': True})

    @staticmethod
    def _generate_files(data, study_abstract, study_type):
        def getrow(header, item, type, index):
            row = []
            for h in header:
                value = item.get(h, '')
                row.append(value if value else 'None')
            return row

        def getfile(type, header, data, **kwargs):
            file = io.StringIO()
            writer = csv.writer(file, dialect='excel-tab')
            writer.writerow(header)

            if type == 'study':
                study_data = kwargs.get('study_data', {})
                item = {**dict(data[0]), **study_data}
                writer.writerow(getrow(header, item, type, 1))
            else:
                for i, item in enumerate(data):
                    writer.writerow(getrow(header, item, type, i))

            return file

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
        experiments_file = getfile('experiment', header, data)

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
        samples_file = getfile('sample', header, data)

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
        studies_file = getfile('study', header, data, study_data={
            'study_type': study_type, 'study_abstract': study_abstract
        })

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
        runs_file = getfile('run', header, data)

        return experiments_file, samples_file, studies_file, runs_file
