import json
import logging
import time
import itertools

from xlwt import Workbook, XFStyle, Formula

from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework.permissions import IsAdminUser

from common.views import CsrfExemptSessionAuthentication
from common.mixins import LibrarySampleMultiEditMixin
from library_sample_shared.utils import get_indices_ids
from index_generator.models import Pool
from library_preparation.models import LibraryPreparation
from library.models import Library
from sample.models import Sample
from .models import Pooling
from .forms import PoolingForm
from .serializers import (PoolingSerializer, PoolingLibrarySerializer,
                          PoolingSampleSerializer)

logger = logging.getLogger('db')


@login_required
@staff_member_required
def get_all(request):
    """ Get the list of all libraries. """
    error = ''
    data = []

    pools = Pool.objects.prefetch_related('libraries', 'samples')
    for pool in pools:
        libraries_in_pool = []
        pool_size = '%ix%i' % (pool.size.multiplier, pool.size.size)

        libraries = pool.libraries.filter(status=2)
        samples = pool.samples.filter(Q(status=3) | Q(status=2) | Q(status=-2))

        sum_sequencing_depth = sum([l.sequencing_depth for l in libraries])
        sum_sequencing_depth += sum([s.sequencing_depth for s in samples])

        # Native libraries
        for library in libraries:
            pooling_obj = Pooling.objects.get(library=library)
            req = library.request.get()
            percentage_library = \
                library.sequencing_depth / sum_sequencing_depth
            index_i7_id, index_i5_id = get_indices_ids(library)

            libraries_in_pool.append({
                'name': library.name,
                'status': library.status,
                'libraryId': library.id,
                'barcode': library.barcode,
                'poolId': pool.id,
                'poolName': pool.name,
                'poolSize': pool_size,
                'requestId': req.id,
                'requestName': req.name,
                # 'concentration': library.concentration,
                'concentration_facility': library.concentration_facility,
                'mean_fragment_size': library.mean_fragment_size,
                'sequencing_depth': library.sequencing_depth,
                'concentration_c1': pooling_obj.concentration_c1,
                'percentage_library': round(percentage_library * 100),
                'index_i7_id': index_i7_id,
                'index_i7': library.index_i7,
                'index_i5_id': index_i5_id,
                'index_i5': library.index_i5,
            })

        # Converted samples (sample -> library)
        for sample in samples:
            lib_prep_obj = LibraryPreparation.objects.get(sample=sample)
            req = sample.request.get()
            percentage_library = \
                sample.sequencing_depth / sum_sequencing_depth
            index_i7_id, index_i5_id = get_indices_ids(sample)

            try:
                concentration_c1 = \
                    Pooling.objects.get(sample=sample).concentration_c1
            except Pooling.DoesNotExist:
                concentration_c1 = None

            libraries_in_pool.append({
                'name': sample.name,
                'status': sample.status,
                'sampleId': sample.pk,
                'barcode': sample.barcode,
                'is_converted': sample.is_converted,
                'poolId': pool.pk,
                'poolName': pool.name,
                'poolSize': pool_size,
                'requestId': req.pk,
                'requestName': req.name,
                # 'concentration': lib_prep_obj.concentration_library,
                'concentration_facility': sample.concentration_facility,
                'mean_fragment_size': lib_prep_obj.mean_fragment_size,
                'sequencing_depth': sample.sequencing_depth,
                'concentration_c1': concentration_c1,
                'percentage_library': round(percentage_library * 100),
                'index_i7_id': index_i7_id,
                'index_i7': sample.index_i7,
                'index_i5_id': index_i5_id,
                'index_i5': sample.index_i5,
            })

        data += libraries_in_pool
        data = sorted(data, key=lambda x: x['barcode'][3:])

    return JsonResponse({'success': not error, 'error': error, 'data': data})


@login_required
@staff_member_required
def update(request):
    """ Update a Pooling object. """
    error = ''

    library_id = request.POST.get('library_id', '')
    sample_id = request.POST.get('sample_id', '')
    qc_result = request.POST.get('qc_result', None)

    try:
        try:
            concentration = float(request.POST.get('concentration'))
        except Exception:
            raise ValueError('Library Concentration is not set.')

        if library_id == '0' or library_id == 0:
            obj = Pooling.objects.get(sample_id=sample_id)
            # record = Sample.objects.get(pk=sample_id)
            record = obj.sample

            # Update concentration value
            lib_prep_obj = LibraryPreparation.objects.get(sample_id=sample_id)
            lib_prep_obj.concentration_library = concentration
            lib_prep_obj.save(update_fields=['concentration_library'])
        else:
            obj = Pooling.objects.get(library_id=library_id)
            # record = Library.objects.get(pk=library_id)
            record = obj.library

            # Update concentration value
            # library = Library.objects.get(pk=library_id)
            record.concentration = concentration
            record.save(update_fields=['concentration'])

        form = PoolingForm(request.POST, instance=obj)

        if form.is_valid():
            form.save()

            if qc_result:
                if qc_result == '1':
                    # TODO@me: use a form to ensure all fields are filled in
                    # If so, then:
                    record.status = 4
                    record.save(update_fields=['status'])
                else:
                    record.status = -1
                    record.save(update_fields=['status'])
        else:
            error = str(form.errors)
            logger.debug(form.errors)

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


class PoolingViewSet(viewsets.ViewSet, LibrarySampleMultiEditMixin):
    permission_classes = [IsAdminUser]
    authentication_classes = [CsrfExemptSessionAuthentication]
    library_model = Library
    sample_model = Sample
    library_serializer = PoolingLibrarySerializer
    sample_serializer = PoolingSampleSerializer

    def list(self, request):
        """ Get the list of all pooling objects. """
        queryset = Pool.objects.order_by('-create_time')
        serializer = PoolingSerializer(queryset, many=True)
        return Response(list(itertools.chain(*serializer.data)))

    @list_route(methods=['post'])
    def download_benchtop_protocol(self, request):
        """ Generate Benchtop Protocol as XLS file for selected records. """
        response = HttpResponse(content_type='application/ms-excel')
        libraries = json.loads(request.data.get('libraries', '[]'))
        samples = json.loads(request.data.get('samples', '[]'))
        pool_id = request.POST.get('pool_id', '')
        pool = Pool.objects.get(pk=pool_id)

        records = list(itertools.chain(
            Library.objects.filter(pk__in=libraries),
            Sample.objects.filter(pk__in=samples),
        ))
        records = sorted(records, key=lambda x: x.barcode[3:])

        f_name = 'Pooling_Benchtop_Protocol.xls'
        response['Content-Disposition'] = 'attachment; filename="%s"' % f_name

        wb = Workbook(encoding='utf-8')

        # First sheet
        ws = wb.add_sheet('Pooling')
        col_letters = {
            0: 'A',   # Request ID
            1: 'B',   # Library
            2: 'C',   # Barcode
            3: 'D',   # Concentration Library
            4: 'E',   # Mean Fragment Size
            5: 'F',   # Library Concentration C1
            6: 'G',   # Sequencing Depth
            7: 'H',   # % library in Pool
            8: 'I',   # Normalized Library Concentration C2
            9: 'J',   # Volume to Pool
            10: 'K',  # µl library
            11: 'L',  # µl EB
        }

        header = ['Request ID', 'Library', 'Barcode',
                  'Concentration Library (ng/µl)', 'Mean Fragment Size (bp)',
                  'Library Concentration C1 (nM)', 'Sequencing Depth (M)',
                  '% library in Pool',
                  'Normalized Library Concentration C2 (nM)',
                  'Volume to Pool (µl)', 'µl library', 'µl EB']

        font_style = XFStyle()
        font_style.alignment.wrap = 1
        font_style_bold = XFStyle()
        font_style_bold.font.bold = True

        ws.write(0, 0, 'Pool ID', font_style_bold)               # A1
        ws.write(0, 1, pool.name, font_style_bold)               # B1
        ws.write(1, 0, 'Pool Volume', font_style_bold)           # A2
        ws.write(2, 0, 'Sum Sequencing Depth', font_style_bold)  # A3
        ws.write(3, 0, '', font_style)                           # A4

        row_num = 4

        for i, column in enumerate(header):
            ws.write(row_num, i, column, font_style_bold)
            ws.col(i).width = 7000  # Set column width

        for record in records:
            row_num += 1
            row_idx = str(row_num + 1)
            req = record.request.get()

            if isinstance(record, Library):
                concentration = record.concentration
                mean_fragment_size = record.mean_fragment_size
            else:
                obj = LibraryPreparation.objects.get(sample=record)
                concentration = obj.concentration_library
                mean_fragment_size = obj.mean_fragment_size

            row = [
                req.name,            # Request ID
                record.name,         # Library
                record.barcode,      # Barcode
                concentration,       # Concentration Library
                mean_fragment_size,  # Mean Fragment Size
            ]

            # Library Concentration C1 =
            # (Library Concentration / Mean Fragment Size * 650) * 10^6
            col_library_concentration = col_letters[3]
            col_mean_fragment_size = col_letters[4]
            formula = '%s%s/(%s%s*650)*1000000' % (
                col_library_concentration, row_idx,
                col_mean_fragment_size, row_idx
            )
            row.append(Formula(formula))

            # Sequencing Depth
            row.append(record.sequencing_depth)

            # % library in Pool
            col_sequencing_depth = col_letters[6]
            formula = '%s%s/$B$3*100' % (col_sequencing_depth, row_idx)
            row.append(Formula(formula))

            row.append('')  # Concentration C2

            # Volume to Pool
            col_percentage = col_letters[7]
            formula = '$B$2*%s%s/100' % (col_percentage, row_idx)
            row.append(Formula(formula))

            # µl library
            col_volume_pool = col_letters[9]
            col_normalization_c2 = col_letters[8]
            col_concentration_c1 = col_letters[5]
            formula = '({}{}*{}{})/{}{}'.format(
                col_volume_pool, row_idx,
                col_normalization_c2, row_idx,
                col_concentration_c1, row_idx,
            )
            row.append(Formula(formula))

            # µl EB
            col_ul_library = col_letters[10]
            formula = '{}{}-{}{}'.format(
                col_volume_pool, row_idx,
                col_ul_library, row_idx,
            )
            row.append(Formula(formula))

            # Add rows to spreadsheet
            for i in range(len(row)):
                ws.write(row_num, i, row[i], font_style)

        # Write Sum µl EB
        col_ul_eb = col_letters[11]
        formula = 'SUM({}{}:{}{})'.format(
            col_ul_eb, 6,
            col_ul_eb, row_idx
        )
        ws.write(int(row_idx), 11, Formula(formula), font_style)

        # Write Sum Sequencing Depth
        formula = 'SUM(%s%s:%s%s)' % (
            col_sequencing_depth, 6,
            col_sequencing_depth, str(row_num + 1)
        )
        ws.write(2, 1, Formula(formula), font_style)

        # Second sheet
        ws = wb.add_sheet('ng-ul to nM')
        ws.write(0, 0, 'Convert ng/µl to nM', font_style_bold)  # A1
        ws.write(2, 0,                                          # A3
                 'Concentration in nM = ((concentration ng/µl) / (650 ' + \
                 'g/mol x average library size bp)) x 10^6', font_style_bold)

        # Table 1
        ws.write(6, 0, 'Date', font_style_bold)                   # A7
        ws.write(6, 1, 'Operator', font_style_bold)               # B7
        ws.write(6, 2, 'Sample ID', font_style_bold)              # C7
        ws.write(6, 3, 'Concentration (ng/µl)', font_style_bold)  # D7
        ws.write(6, 4, 'Average bp', font_style_bold)             # E7
        ws.write(6, 5, 'nM', font_style_bold)                     # F7
        for i in range(40):
            row_idx = 7 + i
            for j in range(5):
                ws.write(row_idx, j, '', font_style)
            formula = f'D{row_idx + 1}/(650*E{row_idx + 1})*10^6'
            ws.write(row_idx, j + 1, Formula(formula), font_style)

        # Table 2
        ws.write(6, 11, 'Guidelines', font_style_bold)    # L7
        ws.write(6, 12, 'nM (optimal)', font_style_bold)  # M7
        ws.write(6, 13, 'possible', font_style_bold)      # N7
        ws.write(7, 11, 'HiSeq3000', font_style)          # L8
        ws.write(8, 11, 'HiSeq2500', font_style)          # L9
        ws.write(9, 11, 'NextSeq', font_style)            # L10
        ws.write(10, 11, 'MiSeq', font_style)             # L11
        ws.write(7, 12, 3, font_style)                    # M8
        ws.write(8, 12, 1, font_style)                    # M9
        ws.write(9, 12, '0.5 - 4', font_style)            # M10
        ws.write(10, 12, 4, font_style)                   # M11
        ws.write(10, 13, 4, font_style)                   # N11

        # Table 3
        ws.write(13, 8, 'Add V2 to samples to reach desired C2', font_style)
        ws.write(14, 8, 'V1', font_style_bold)   # I15
        ws.write(14, 9, 'C1', font_style_bold)   # J15
        ws.write(14, 10, 'V2', font_style_bold)  # K15
        ws.write(14, 11, 'C2', font_style_bold)  # L15
        for i in range(8):
            row_idx = 15 + i
            ws.write(row_idx, 8, '', font_style)                   # V1
            formula_c1 = f'F{8 + i}'
            ws.write(row_idx, 9, Formula(formula_c1), font_style)  # C1
            v2_idx = row_idx + 1
            formula_v2 = f'((I{v2_idx}*J{v2_idx})/L{v2_idx})-I{v2_idx}'
            ws.write(row_idx, 10, Formula(formula_v2), font_style)  # V2
            ws.write(row_idx, 11, 4 + i, font_style)  # C2

        wb.save(response)
        return response

    @list_route(methods=['post'])
    def download_pooling_template(self, request):
        """ Generate Pooling Template as XLS file for selected records. """
        response = HttpResponse(content_type='application/ms-excel')
        libraries = json.loads(request.data.get('libraries', '[]'))
        samples = json.loads(request.data.get('samples', '[]'))

        records = list(itertools.chain(
            Library.objects.filter(pk__in=libraries),
            Sample.objects.filter(pk__in=samples),
        ))
        records = sorted(records, key=lambda x: x.barcode[3:])

        f_name = 'QC_Normalization_and_Pooling_Template.xls'
        response['Content-Disposition'] = 'attachment; filename="%s"' % f_name

        wb = Workbook(encoding='utf-8')
        ws = wb.add_sheet('QC Normalization and Pooling')
        col_letters = {
            0: 'A',   # Library
            1: 'B',   # Barcode
            2: 'C',   # ng/µl
            3: 'D',   # bp
            4: 'E',   # nM
            5: 'F',   # Date
            6: 'G',   # Comments
        }

        header = ['Library', 'Barcode', 'ng/µl', 'bp', 'nM', 'Date',
                  'Comments']
        row_num = 0

        font_style = XFStyle()
        font_style.font.bold = True

        for i, column in enumerate(header):
            ws.write(row_num, i, column, font_style)
            ws.col(i).width = 7000  # Set column width

        font_style = XFStyle()
        font_style.alignment.wrap = 1

        for record in records:
            row_num += 1
            row_idx = str(row_num + 1)

            if isinstance(record, Library):
                # obj = Pooling.objects.get(library=record)
                mean_fragment_size = record.mean_fragment_size
            else:
                # obj = Pooling.objects.get(sample=record)
                lib_prep_obj = LibraryPreparation.objects.get(sample=record)
                mean_fragment_size = lib_prep_obj.mean_fragment_size

            row = [
                record.name,                    # Library
                record.barcode,                 # Barcode
                record.concentration_facility,  # ng/µl
                mean_fragment_size,             # bp
            ]

            # nM = Library Concentration / ( Mean Fragment Size * 650 ) * 10^6
            col_concentration = col_letters[2]
            col_mean_fragment_size = col_letters[3]
            formula = col_concentration + row_idx + '/ (' + \
                col_mean_fragment_size + row_idx + ') * 1000000'
            row.append(Formula(formula))

            row.extend([
                time.strftime('%d.%m.%Y'),  # Date
                record.comments,            # Comments
            ])

            for i in range(2):
                ws.write(row_num, i, row[i], font_style)

        wb.save(response)
        return response
