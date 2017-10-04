import json
import logging
import time
import itertools

from xlwt import Workbook, XFStyle, Formula

from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.core.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework.permissions import IsAdminUser

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


@login_required
@staff_member_required
def update_all(request):
    """ Update a field in all records. """
    error = ''

    if request.is_ajax():
        data = json.loads(request.body.decode('utf-8'))
        for item in data:
            try:
                if item['sample_id'] == 0 or item['sample_id'] == '0':
                    # library = Library.objects.get(pk=item['library_id'])
                    # obj = Pooling.objects.get(library=library)
                    obj = Pooling.objects.get(library_id=item['library_id'])
                else:
                    # sample = Sample.objects.get(pk=item['sample_id'])
                    # obj = Pooling.objects.get(sample=sample)
                    obj = Pooling.objects.get(sample_id=item['sample_id'])
                changed_value = item['changed_value']
                for key, value in changed_value.items():
                    if hasattr(obj, key):
                        try:
                            val = obj._meta.get_field(key).to_python(value)
                            if val is None:
                                raise ValidationError('Wrong value.')
                        except ValidationError:
                            pass
                        else:
                            setattr(obj, key, value)
                obj.save()

            except Exception as e:
                error = 'Some of the records were not updated ' + \
                    '(see the logs).'
                logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@login_required
@staff_member_required
def qc_update_all(request):
    """ Update QC Result for given libraries and samples. """
    error = ''

    libraries = json.loads(request.POST.get('libraries', '[]'))
    samples = json.loads(request.POST.get('samples', '[]'))
    result = json.loads(request.POST.get('result', ''))
    qc_result = 4 if result is True else -1

    try:
        for library_id in libraries:
            library = Library.objects.get(pk=library_id)
            library.status = qc_result
            library.save(update_fields=['status'])

        for sample_id in samples:
            sample = Sample.objects.get(pk=sample_id)
            sample.status = qc_result
            sample.save(update_fields=['status'])

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


class PoolingViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        """ Get the list of all pooling objects. """
        queryset = Pool.objects.order_by('-create_time')
        serializer = PoolingSerializer(queryset, many=True)
        return Response(list(itertools.chain(*serializer.data)))

    @list_route(methods=['post'])
    def edit(self, request):
        """ Update multiple objects. """
        if request.is_ajax():
            post_data = request.data.get('data', [])
        else:
            post_data = json.loads(request.data.get('data', '[]'))

        if not post_data:
            return Response({
                'success': False,
                'message': 'Invalid payload.',
            }, 400)

        library_ids, sample_ids, library_post_data, sample_post_data = \
            self._separate_data(post_data)

        libraries_ok, libraries_no_invalid = self._update_objects(
            Library, PoolingLibrarySerializer, library_ids, library_post_data)

        samples_ok, samples_no_invalid = self._update_objects(
            Sample, PoolingSampleSerializer, sample_ids, sample_post_data)

        result = [libraries_ok, libraries_no_invalid,
                  samples_ok, samples_no_invalid]
        result = [x for x in result if x is not None]

        if result.count(True) == len(result):
            return Response({'success': True})
        elif result.count(False) == len(result):
            return Response({
                'success': False,
                'message': 'Invalid payload.',
            }, 400)
        else:
            return Response({
                'success': True,
                'message': 'Some records cannot be updated.',
            })

    def _separate_data(self, data):
        """
        Separate library and sample data, ignoring objects without
        either 'id' or 'record_type' or non-integer id.
        """
        library_ids = []
        sample_ids = []
        library_data = []
        sample_data = []

        for obj in data:
            try:
                if obj['record_type'] == 'Library':
                    library_ids.append(int(obj['pk']))
                    library_data.append(obj)
                elif obj['record_type'] == 'Sample':
                    sample_ids.append(int(obj['pk']))
                    sample_data.append(obj)
            except (KeyError, ValueError):
                continue

        return library_ids, sample_ids, library_data, sample_data

    def _update_objects(self, model_class, serializer_class, ids, data):
        """
        Update multiple objects with a given model class and a
        serializer class.
        """
        objects_ok = True
        no_invalid = True

        # objects = model_class.objects.filter(pk__in=ids, status=1)
        objects = model_class.objects.filter(pk__in=ids)

        if not objects:
            return None, None

        serializer = serializer_class(data=data, instance=objects, many=True)

        if serializer.is_valid():
            serializer.save()
        else:
            # Try to update valid objects
            valid_data = [item[1] for item in zip(serializer.errors, data)
                          if not item[0]]

            if any(valid_data):
                new_ids = [x['pk'] for x in valid_data]
                self._update_valid(
                    model_class, serializer_class, new_ids, valid_data)
            else:
                objects_ok = False
                no_invalid = False

        return objects_ok, no_invalid

    def _update_valid(self, model_class, serializer_class, ids, valid_data):
        """ Update valid objects. """
        objects = model_class.objects.filter(pk__in=ids)
        serializer = serializer_class(
            data=valid_data, instance=objects, many=True)
        serializer.is_valid()
        serializer.save()


@csrf_exempt
@login_required
@staff_member_required
def download_benchtop_protocol(request):
    """ Generate Benchtop Protocol as XLS file for selected records. """
    response = HttpResponse(content_type='application/ms-excel')
    libraries = json.loads(request.POST.get('libraries', '[]'))
    samples = json.loads(request.POST.get('samples', '[]'))
    pool_name = request.POST.get('pool_name', '')

    filename = 'Pooling_Benchtop_Protocol.xls'
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename

    wb = Workbook(encoding='utf-8')
    ws = wb.add_sheet('Benchtop Protocol')
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
        9: 'J',   # Sample Volume V1
        10: 'K',  # Buffer Volume V2
        11: 'L',  # Volume to Pool
    }

    try:
        records = [Library.objects.get(pk=lib_id) for lib_id in libraries] + \
            [Sample.objects.get(pk=smpl_id) for smpl_id in samples]
        records = sorted(records, key=lambda x: x.barcode)

        header = ['Request ID', 'Library', 'Barcode',
                  'Concentration Library (ng/µl)', 'Mean Fragment Size (bp)',
                  'Library Concentration C1 (nM)', 'Sequencing Depth (M)',
                  '% library in Pool',
                  'Normalized Library Concentration C2 (nM)',
                  'Sample Volume V1 (µl)', 'Buffer Volume V2 (µl)',
                  'Volume to Pool (µl)']

        font_style = XFStyle()
        font_style.alignment.wrap = 1
        font_style_bold = XFStyle()
        font_style_bold.font.bold = True

        ws.write(0, 0, 'Pool ID', font_style_bold)
        ws.write(0, 1, pool_name, font_style_bold)
        ws.write(1, 0, 'Pool Volume', font_style_bold)  # B2
        ws.write(2, 0, 'Sum Sequencing Depth', font_style_bold)  # B3
        ws.write(3, 0, '', font_style)

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

            row = [req.name, record.name, record.barcode, concentration,
                   mean_fragment_size]

            # Library Concentration C1 =
            # (Library Concentration / Mean Fragment Size * 650) * 10^6
            col_library_concentration = col_letters[3]
            col_mean_fragment_size = col_letters[4]
            formula = '%s%s/(%s%s*650)*1000000' % (
                col_library_concentration, row_idx,
                col_mean_fragment_size, row_idx
            )
            row.append(Formula(formula))

            row.append(record.sequencing_depth)

            # % library in Pool
            col_sequencing_depth = col_letters[6]
            formula = '%s%s/$B$3*100' % (col_sequencing_depth, row_idx)
            row.append(Formula(formula))

            row.extend(['', ''])  # Concentration C2 and Sample Volume V1

            # Buffer Volume V2 =
            # ((Concentration C1 * Sample Volume V1) / Concentration C2) -
            # Sample Volume V1
            col_concentration_c1 = col_letters[5]
            col_concentration_c2 = col_letters[8]
            col_sample_volume = col_letters[9]
            formula = '((%s%s*%s%s)/%s%s)-%s%s' % (
                col_concentration_c1, row_idx,
                col_sample_volume, row_idx,
                col_concentration_c2, row_idx,
                col_sample_volume, row_idx,
            )
            row.append(Formula(formula))

            # Volume to Pool
            col_percentage = col_letters[7]
            formula = '$B$2*%s%s/100' % (col_percentage, row_idx)
            row.append(Formula(formula))

            for i in range(len(row)):
                ws.write(row_num, i, row[i], font_style)

        # Write Sum Sequencing Depth
        formula = 'SUM(%s%s:%s%s)' % (
            col_sequencing_depth, 6,
            col_sequencing_depth, str(row_num + 1)
        )
        ws.write(2, 1, Formula(formula), font_style)

    except Exception as e:
        logger.exception(e)

    wb.save(response)

    return response


@csrf_exempt
@login_required
@staff_member_required
def download_pooling_template(request):
    response = HttpResponse(content_type='application/ms-excel')
    libraries = json.loads(request.POST.get('libraries', '[]'))
    samples = json.loads(request.POST.get('samples', '[]'))

    filename = 'QC_Normalization_and_Pooling_Template.xls'
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename

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

    try:
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

        for library_id in libraries:
            row_num += 1
            row_idx = str(row_num + 1)

            obj = Pooling.objects.get(library_id=library_id)
            row = [
                obj.library.name,
                obj.library.barcode,
                obj.library.concentration,
                obj.library.mean_fragment_size
            ]

            # nM = Library Concentration / ( Mean Fragment Size * 650 ) * 10^6
            col_concentration = col_letters[2]
            col_mean_fragment_size = col_letters[3]
            formula = col_concentration + row_idx + '/ (' + \
                col_mean_fragment_size + row_idx + ') * 1000000'
            row.append(Formula(formula))

            row.extend([
                time.strftime('%d.%m.%Y'),
                obj.library.comments
            ])

            for i in range(2):
                ws.write(row_num, i, row[i], font_style)

        for sample_id in samples:
            row_num += 1
            row_idx = str(row_num + 1)

            obj = Pooling.objects.get(sample_id=sample_id)
            lib_prep_obj = LibraryPreparation.objects.get(sample=obj.sample)
            row = [
                obj.sample.name,
                obj.sample.barcode,
                lib_prep_obj.concentration_library,
                lib_prep_obj.mean_fragment_size
            ]

            # nM = Library Concentration / ( Mean Fragment Size * 650 ) * 10^6
            col_concentration = col_letters[2]
            col_mean_fragment_size = col_letters[3]
            formula = col_concentration + row_idx + '/ (' + \
                col_mean_fragment_size + row_idx + ') * 1000000'
            row.append(Formula(formula))

            row.extend([
                time.strftime('%d.%m.%Y'),
                obj.library.comments
            ])

            for i in range(2):
                ws.write(row_num, i, row[i], font_style)

    except Exception as e:
        logger.exception(e)

    wb.save(response)

    return response
