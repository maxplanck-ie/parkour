import logging
import json

from django.http import HttpResponse
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route
# from rest_framework.decorators import authentication_classes
from rest_framework.permissions import IsAdminUser

from xlwt import Workbook, XFStyle, Formula

from common.views import CsrfExemptSessionAuthentication
from common.mixins import MultiEditMixin
from library_sample_shared.utils import get_indices_ids

from .models import LibraryPreparation
from .serializers import LibraryPreparationSerializer

logger = logging.getLogger('db')


class LibraryPreparationViewSet(MultiEditMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    authentication_classes = [CsrfExemptSessionAuthentication]
    serializer_class = LibraryPreparationSerializer

    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        data = sorted(serializer.data, key=lambda x: x['barcode'][3:])
        return Response(data)

    def get_queryset(self):
        return LibraryPreparation.objects.select_related('sample').filter(
            Q(sample__status=2) | Q(sample__status=-2)
        )

    @list_route(methods=['post'])
    # @authentication_classes((CsrfExemptSessionAuthentication))
    def download_benchtop_protocol(self, request):
        """ Generate Benchtop Protocol as XLS file for selected samples. """
        response = HttpResponse(content_type='application/ms-excel')
        ids = json.loads(request.data.get('ids', '[]'))
        objects = LibraryPreparation.objects.filter(pk__in=ids).order_by(
            'sample__barcode',
        )

        f_name = 'Library_Preparation_Benchtop_Protocol.xls'
        response['Content-Disposition'] = 'attachment; filename="%s"' % f_name

        wb = Workbook(encoding='utf-8')
        ws = wb.add_sheet('Benchtop Protocol')
        col_letters = {
            0: 'A',   # Request ID
            1: 'B',   # Pool ID
            2: 'C',   # Sample
            3: 'D',   # Barcode
            4: 'E',   # Protocol
            5: 'F',   # Concentration Sample
            6: 'G',   # Starting Amount
            7: 'H',   # Starting Volume
            8: 'I',   # Spike-in Description
            9: 'J',   # Spike-in Volume
            10: 'K',  # µl Sample
            11: 'L',  # µl Buffer
            12: 'M',  # Index I7 ID
            13: 'N',  # Index I5 ID
        }

        header = ['Request ID', 'Pool ID', 'Sample', 'Barcode', 'Protocol',
                  'Concentration Sample (ng/µl)', 'Starting Amount (ng)',
                  'Starting Volume (µl)', 'Spike-in Description',
                  'Spike-in Volume (µl)', 'µl Sample', 'µl Buffer',
                  'Index I7 ID', 'Index I5 ID']
        row_num = 0

        font_style = XFStyle()
        font_style.font.bold = True

        for i, column in enumerate(header):
            ws.write(row_num, i, column, font_style)
            ws.col(i).width = 7000  # Set column width

        font_style = XFStyle()
        font_style.alignment.wrap = 1

        for lib_prep_obj in objects:
            sample = lib_prep_obj.sample
            req = sample.request.get()
            pool = sample.pool.get()
            index_i7_id, index_i5_id = get_indices_ids(sample)
            row_num += 1
            row_idx = str(row_num + 1)

            row = [
                req.name,                           # Request
                pool.name,                          # Pool
                sample.name,                        # Sample
                sample.barcode,                     # Barcode
                sample.library_protocol.name,       # Library Protocol
                sample.concentration_facility,      # Concentration
                lib_prep_obj.starting_amount,       # Starting Amount
                '',                                 # Starting Volume
                lib_prep_obj.spike_in_description,  # Spike-in Description
                '',                                 # Spike-in Volume
            ]

            # µl Sample = Starting Amount / Concentration Sample
            col_starting_amount = col_letters[6]
            col_concentration = col_letters[5]
            formula = col_starting_amount + row_idx + '/' + \
                col_concentration + row_idx
            row.append(Formula(formula))

            # µl Buffer = Starting Volume - Spike-in Volume - µl Sample
            col_starting_volume = col_letters[7]
            col_ul_sample = col_letters[10]
            col_spike_in_volume = col_letters[9]
            formula = '{}{}-{}{}-{}{}'.format(
                col_starting_volume, row_idx,
                col_spike_in_volume, row_idx,
                col_ul_sample, row_idx,
            )
            row.append(Formula(formula))

            row.extend([index_i7_id, index_i5_id])

            for i in range(len(row)):
                ws.write(row_num, i, row[i], font_style)

        wb.save(response)

        return response
