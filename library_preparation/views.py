import logging
import json

from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.core.exceptions import ValidationError
from xlwt import Workbook, XFStyle, Formula

from library_sample_shared.models import IndexType
from sample.models import Sample
from pooling.models import Pooling
from .models import LibraryPreparation
from .forms import LibraryPreparationForm

logger = logging.getLogger('db')


def get_indices_ids(sample):
    """ Get Index I7/I5 ids for a given sample. """
    try:
        index_type = IndexType.objects.get(pk=sample.index_type.pk)
        index_i7 = index_type.indices_i7.get(index=sample.index_i7)
        index_i7_id = index_i7.index_id
    except Exception:
        index_i7_id = ''

    try:
        index_type = IndexType.objects.get(pk=sample.index_type.pk)
        index_i5 = index_type.indices_i5.get(index=sample.index_i5)
        index_i5_id = index_i5.index_id
    except Exception:
        index_i5_id = ''

    return index_i7_id, index_i5_id


@login_required
@staff_member_required
def get_all(request):
    """ Get the list of all samples for Library Preparation. """
    error = ''
    data = []

    objects = LibraryPreparation.objects.select_related('sample')

    for obj in objects:
        req = obj.sample.request.get()

        if obj and (obj.sample.status == 2 or obj.sample.status == -2):
            # pool = obj.sample.pool.get()
            pool = obj.sample.pool.filter()[0]
            index_i7_id, index_i5_id = get_indices_ids(obj.sample)
            data.append({
                'active': False,
                'name': obj.sample.name,
                'requestName': req.name,
                'poolName': pool.name,
                'sampleId': obj.sample.pk,
                'barcode': obj.sample.barcode,
                'is_converted': obj.sample.is_converted,
                'comments': obj.sample.comments_facility,
                'libraryProtocol': obj.sample.library_protocol.pk,
                'libraryProtocolName': obj.sample.library_protocol.name,
                'concentration_sample': obj.sample.concentration,
                'starting_amount': obj.starting_amount,
                'starting_volume': obj.starting_volume,
                'spike_in_description': obj.spike_in_description,
                'spike_in_volume': obj.spike_in_volume,
                'indexI7Id': index_i7_id,
                'indexI5Id': index_i5_id,
                'pcr_cycles': obj.pcr_cycles,
                'concentration_library': obj.concentration_library,
                'mean_fragment_size': obj.mean_fragment_size,
                'dilution_factor': obj.sample.dilution_factor,
                'nM': obj.nM,
            })
    data = sorted(data, key=lambda x: x['barcode'][3:])
    return JsonResponse({'success': not error, 'error': error, 'data': data})


@login_required
@staff_member_required
def update(request):
    """ Update a Library Preparation object. """
    sample_id = request.POST.get('sample_id', '')
    qc_result = request.POST.get('qc_result', None)
    error = ''

    try:
        sample = Sample.objects.get(pk=sample_id)
        obj = LibraryPreparation.objects.get(sample=sample)
        form = LibraryPreparationForm(request.POST, instance=obj)

        if form.is_valid():
            form.save()
            concentration_sample = request.POST.get('concentration_sample', 0)
            sample.concentration = concentration_sample
            sample.save()

            if qc_result:
                if qc_result == '1':
                    if not obj.concentration_library:
                        raise ValueError('Library Concentartion is not set.')
                    sample.status = 3
                    sample.save(update_fields=['status'])

                    # Create Pooling object
                    pooling_obj = Pooling(sample=sample)

                    # Update Concentration C1
                    library_concentration = obj.concentration_library
                    mean_fragment_size = obj.mean_fragment_size
                    if mean_fragment_size and mean_fragment_size > 0:
                        concentration_c1 = \
                            round((library_concentration /
                                  (mean_fragment_size * 650)) * 10**6, 2)
                        pooling_obj.concentration_c1 = concentration_c1

                    pooling_obj.save()

                else:
                    sample.status = -1
                    sample.save(update_fields=['status'])
        else:
            error = str(form.errors)
            logger.debug(form.errors)

    except Exception as e:
        logger.exception(e)
        error = str(e)

    return JsonResponse({'success': not error, 'error': error})


@login_required
@staff_member_required
def update_all(request):
    """ Update a field in all records (apply to all). """
    error = ''

    if request.is_ajax():
        data = json.loads(request.body.decode('utf-8'))
        for item in data:
            try:
                sample_id = item['sample_id']
                obj = LibraryPreparation.objects.get(sample_id=sample_id)
                changed_value = item['changed_value']
                for key, value in changed_value.items():
                    if key == 'concentration_sample':
                        obj.sample.concentration = value
                        obj.sample.save(update_fields=['concentration'])
                    elif hasattr(obj, key):
                        try:
                            val = obj._meta.get_field(key).to_python(value)
                            if val is None:
                                raise ValidationError('Wrong value.')
                        except ValidationError:
                            pass
                        else:
                            setattr(obj, key, value)

                # Calculate nM
                if 'nM' not in changed_value.keys():
                    cl = obj.concentration_library
                    mfs = obj.mean_fragment_size
                    if all([cl, mfs]) and cl > 0.0 and mfs > 0.0:
                        obj.nM = round((cl / (650 * mfs)) * 10**6, 2)

                obj.save()

            except Exception as e:
                error = 'Some of the libraries were not updated ' + \
                    '(see the logs).'
                logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@csrf_exempt
@login_required
@staff_member_required
def download_benchtop_protocol(request):
    """ Generate Benchtop Protocol as XLS file for selected samples. """
    response = HttpResponse(content_type='application/ms-excel')
    samples = json.loads(request.POST.get('samples', '[]'))

    filename = 'Library_Preparation_Benchtop_Protocol.xls'
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename

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

    try:
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

        for sample_id in samples:
            obj = LibraryPreparation.objects.get(sample_id=sample_id)
            req = obj.sample.request.get()
            pool = obj.sample.pool.get()
            index_i7_id, index_i5_id = get_indices_ids(obj.sample)
            row_num += 1
            row_idx = str(row_num + 1)

            row = [req.name, pool.name, obj.sample.name, obj.sample.barcode,
                   obj.sample.library_protocol.name, obj.sample.concentration,
                   obj.starting_amount, obj.starting_volume,
                   obj.spike_in_description, obj.spike_in_volume]

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
            formula = col_starting_volume + row_idx + '-' + \
                col_spike_in_volume + row_idx + '-' + \
                col_ul_sample + row_idx
            row.append(Formula(formula))

            row.extend([index_i7_id, index_i5_id])

            for i in range(len(row)):
                ws.write(row_num, i, row[i], font_style)

    except Exception as e:
        logger.exception(e)

    wb.save(response)

    return response
