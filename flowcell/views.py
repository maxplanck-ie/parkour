import csv
import json
import logging
import unicodedata
import itertools

from django.apps import apps
from django.db.models import Q, Prefetch
from django.http import HttpResponse

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework.permissions import IsAdminUser

from xlwt import Workbook, XFStyle

from common.utils import print_sql_queries
from common.views import CsrfExemptSessionAuthentication
from common.mixins import MultiEditMixin

from .models import Sequencer, Lane, Flowcell
from .serializers import (
    SequencerSerializer,
    FlowcellSerializer,
    FlowcellListSerializer,
    LaneSerializer,
    PoolSerializer,
    PoolInfoSerializer,
)

ReadLength = apps.get_model('library_sample_shared', 'ReadLength')
IndexI7 = apps.get_model('library_sample_shared', 'IndexI7')
IndexI5 = apps.get_model('library_sample_shared', 'IndexI5')
Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')
Pool = apps.get_model('index_generator', 'Pool')

logger = logging.getLogger('db')


def indices_present(libraries, samples):
    count_total = libraries.count() + samples.count()
    index_i7_count = 0
    index_i5_count = 0
    equal_representation_count = 0

    for library in libraries:
        if library.index_i7 != '':
            index_i7_count += 1
        if library.index_i5 != '':
            index_i5_count += 1
        if library.equal_representation_nucleotides:
            equal_representation_count += 1

    for sample in samples:
        if sample.index_i7 != '':
            index_i7_count += 1
        if sample.index_i5 != '':
            index_i5_count += 1
        if sample.equal_representation_nucleotides:
            equal_representation_count += 1

    # If at least one Index I7/I5 is set
    index_i7_show = 'Yes' if index_i7_count > 0 else 'No'
    index_i5_show = 'Yes' if index_i5_count > 0 else 'No'

    # If all Equal Representation are set
    equal_representation = 'Yes' \
        if equal_representation_count == count_total else 'No'

    return index_i7_show, index_i5_show, equal_representation


class SequencerViewSet(viewsets.ReadOnlyModelViewSet):
    """ Get the list of sequencers. """
    queryset = Sequencer.objects.all()
    serializer_class = SequencerSerializer


class PoolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Pool.objects.all()
    serializer_class = PoolInfoSerializer
    permission_classes = [IsAdminUser]

    def retrieve(self, request, pk=None):
        """ Get libraries and samples for a pool with a given id. """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data['records'])


class FlowcellViewSet(MultiEditMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    authentication_classes = [CsrfExemptSessionAuthentication]
    serializer_class = LaneSerializer

    def get_queryset(self):
        libraries_qs = Library.objects.filter(
            ~Q(status=-1)).prefetch_related('read_length').only(
                'read_length', 'equal_representation_nucleotides')
        samples_qs = Sample.objects.filter(
            ~Q(status=-1)).prefetch_related('read_length').only(
                'read_length', 'equal_representation_nucleotides')

        lanes_qs = Lane.objects.filter(completed=False).select_related(
            'pool',
        ).prefetch_related(
            Prefetch('pool__libraries', queryset=libraries_qs),
            Prefetch('pool__samples', queryset=samples_qs),
        ).order_by('name')

        queryset = Flowcell.objects.select_related(
            'sequencer'
        ).prefetch_related(
            Prefetch('lanes', queryset=lanes_qs),
        ).order_by('-create_time')

        return queryset

    # @print_sql_queries
    def list(self, request, *args, **kwargs):
        serializer = FlowcellListSerializer(self.get_queryset(), many=True)
        data = list(itertools.chain(*serializer.data))
        return Response(data)

    def create(self, request):
        """ Add a flowcell. """

        if request.is_ajax():
            post_data = request.data.get('data', [])
            if isinstance(post_data, str):
                post_data = json.loads(post_data)
        else:
            post_data = json.loads(request.data.get('data', '[]'))

        if not post_data:
            return Response({
                'success': False,
                'message': 'Invalid payload.',
            }, 400)

        serializer = FlowcellSerializer(data=post_data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True}, 201)

        else:
            return Response({
                'success': False,
                'message': 'Invalid payload.',
                'errors': serializer.errors,
            }, 400)

    @list_route(methods=['get'])
    def pool_list(self, request):
        data = []
        queryset = Pool.objects.all().prefetch_related(
            'libraries', 'samples',
        ).order_by('pk')

        for pool in queryset:
            # Show libraries which have reached the Pooling step
            libraries = pool.libraries.filter(status__gte=2)

            # Show samples which have reached the Pooling step
            samples = pool.samples.filter(status__gte=3)

            # Ignore pools if all of its libraries/samples are
            # not ready yet or failed
            if libraries.count() + samples.count() == 0:
                continue

            # Ignore pools if some of its samples haven't reached the
            # Pooling step yet
            if pool.samples.filter(~Q(status=-1)).count() > 0 and \
                    pool.samples.filter(
                        Q(status=2) | Q(status=-2)).count() > 0:
                continue

            if pool.size.multiplier > pool.loaded:
                serializer = PoolSerializer(pool)
                data.append(serializer.data)

        data = sorted(data, key=lambda x: x['ready'], reverse=True)
        return Response(data)

    @list_route(methods=['post'])
    def download_benchtop_protocol(self, request):
        """ Generate Benchtop Protocol as XLS file for selected lanes. """
        response = HttpResponse(content_type='application/ms-excel')
        ids = json.loads(request.data.get('ids', '[]'))

        f_name = 'FC_Loading_Benchtop_Protocol.xls'
        response['Content-Disposition'] = 'attachment; filename="%s"' % f_name

        wb = Workbook(encoding='utf-8')
        ws = wb.add_sheet('FC_Loading_Benchtop_Protocol')

        header = ['Pool ID', 'Flowcell ID', 'Sequencer', 'Lane', 'I7 present',
                  'I5 present', 'Equal Representation of Nucleotides',
                  'Read Length', 'Loading Concentration', 'PhiX %']
        row_num = 0

        font_style = XFStyle()
        font_style.font.bold = True

        for i, column in enumerate(header):
            ws.write(row_num, i, column, font_style)
            ws.col(i).width = 7000  # Set column width

        font_style = XFStyle()
        font_style.alignment.wrap = 1

        lanes = Lane.objects.filter(pk__in=ids).order_by('name')
        for lane in lanes:
            flowcell = lane.flowcell.get()
            row_num += 1

            records = lane.pool.libraries.all() or lane.pool.samples.all()
            read_length = records[0].read_length.name

            equal_representation = self._get_equal_representation(lane)

            row = [
                lane.pool.name,              # Pool ID
                flowcell.flowcell_id,        # Flowcell ID
                flowcell.sequencer.name,     # Sequencer
                lane.name,                   # Lane
                '',                          # I7 present
                '',                          # I5 present
                equal_representation,        # Equal Representation of Nucl.
                read_length,                 # Read Length
                lane.loading_concentration,  # Loading Concentration
                lane.phix,                   # PhiX %
            ]

            for i in range(len(row)):
                ws.write(row_num, i, row[i], font_style)

        wb.save(response)

        return response

    @list_route(methods=['post'])
    def download_sample_sheet(self, request):
        """ Generate Benchtop Protocol as XLS file for selected lanes. """
        response = HttpResponse(content_type='text/csv')
        ids = json.loads(request.data.get('ids', '[]'))
        flowcell_id = request.data.get('flowcell_id', '')

        writer = csv.writer(response)
        writer.writerow(['[Header]', '', '', '', '', '', '', '', '', '', ''])
        writer.writerow(['IEMFileVersion', '4', '', '', '', '', '', '', '', '',
                        ''])
        writer.writerow(['Date', '11/3/2016', '', '', '', '', '', '', '', '',
                         ''])
        writer.writerow(['Workflow', 'GenerateFASTQ', '', '', '', '', '', '',
                         '', '', ''])
        writer.writerow(['Application', 'HiSeq FASTQ Only', '', '', '', '', '',
                         '', '', '', ''])
        writer.writerow(['Assay', 'Nextera XT', '', '', '', '', '', '', '', '',
                        ''])
        writer.writerow(['Description', '', '', '', '', '', '', '', '', '',
                         ''])
        writer.writerow(['Chemistry', 'Amplicon', '', '', '', '', '', '', '',
                         '', ''])
        writer.writerow(['', '', '', '', '', '', '', '', '', '', ''])
        writer.writerow(['[Reads]', '', '', '', '', '', '', '', '', '', ''])
        writer.writerow(['75', '', '', '', '', '', '', '', '', '', ''])
        writer.writerow(['75', '', '', '', '', '', '', '', '', '', ''])
        writer.writerow(['', '', '', '', '', '', '', '', '', '', ''])
        writer.writerow(['[Settings]', '', '', '', '', '', '', '', '', '', ''])
        writer.writerow(['ReverseComplement', '0', '', '', '', '', '', '', '',
                         '', ''])
        writer.writerow(['Adapter', 'CTGTCTCTTATACACATCT', '', '', '', '', '',
                         '', '', '', ''])
        writer.writerow(['', '', '', '', '', '', '', '', '', '', ''])
        writer.writerow(['[Data]', '', '', '', '', '', '', '', '', '', ''])

        writer.writerow(['Lane', 'Sample_ID', 'Sample_Name', 'Sample_Plate',
                         'Sample_Well', 'I7_Index_ID', 'index', 'I5_Index_ID',
                         'index2', 'Sample_Project', 'Description'])

        flowcell = Flowcell.objects.get(pk=flowcell_id)
        f_name = '%s_SampleSheet.csv' % flowcell.flowcell_id
        response['Content-Disposition'] = 'attachment; filename="%s"' % f_name

        lanes = Lane.objects.filter(pk__in=ids).order_by('name')

        rows = []
        for lane in lanes:
            records = list(itertools.chain(
                lane.pool.libraries.all().filter(~Q(status=-1)),
                lane.pool.samples.all().filter(~Q(status=-1))
            ))

            for record in records:
                row = self._create_row(lane, record)
                rows.append(row)

        rows = sorted(rows, key=lambda x: (x[0], x[1][3:]))
        for row in rows:
            writer.writerow(row)

        return response

    def _get_equal_representation(self, obj):
        libraries = obj.pool.libraries.filter(~Q(status=-1))
        samples = obj.pool.samples.filter(~Q(status=-1))

        eqn_libraries = list(libraries.values_list(
            'equal_representation_nucleotides', flat=True)).count(True)

        eqn_samples = list(samples.values_list(
            'equal_representation_nucleotides', flat=True)).count(True)

        return libraries.count() + samples.count() == \
            eqn_libraries + eqn_samples

    def _create_row(self, lane, record):
        index_i7 = IndexI7.objects.filter(
            index=record.index_i7,
            index_type=record.index_type
        )
        index_i7_id = index_i7[0].index_id if index_i7 else ''

        index_i5 = IndexI5.objects.filter(
            index=record.index_i5,
            index_type=record.index_type
        )
        index_i5_id = index_i5[0].index_id if index_i5 else ''

        request_name = unicodedata.normalize(
            'NFKD', record.request.get().name)
        request_name = str(request_name.encode('ASCII', 'ignore'), 'utf-8')

        library_protocol = unicodedata.normalize(
            'NFKD', record.library_protocol.name)
        library_protocol = str(
            library_protocol.encode('ASCII', 'ignore'), 'utf-8')

        return [
            lane.name.split()[1],  # Lane
            record.barcode,        # Sample_ID
            record.name,           # Sample_Name
            '',                    # Sample_Plate
            '',                    # Sample_Well
            index_i7_id,           # I7_Index_ID
            record.index_i7,       # index
            index_i5_id,           # I5_Index_ID
            record.index_i5,       # index2
            request_name,          # Sample_Project / Request ID
            library_protocol,      # Description / Library Protocol
        ]
