import logging
import json
from xlwt import Workbook, XFStyle, Formula

from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

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
    except Exception:
        index_i7_id = ''
    else:
        index_i7_id = index_i7.index_id

    try:
        index_type = IndexType.objects.get(pk=sample.index_type.pk)
        index_i5 = index_type.indices_i5.get(index=sample.index_i5)
    except Exception:
        index_i5_id = ''
    else:
        index_i5_id = index_i5.index_id

    return index_i7_id, index_i5_id


@login_required
def get_all(request):
    """ Get the list of all samples for Library Preparation. """
    error = ''
    data = []

    objects = LibraryPreparation.objects.select_related('sample')

    for obj in objects:
        if not request.user.is_staff:
            user_id = obj.sample.request.get().user_id
            if user_id != request.user.id:
                obj = None

        if obj and obj.sample.status == 2:
            index_i7_id, index_i5_id = get_indices_ids(obj.sample)
            data.append({
                'active': False,
                'name': obj.sample.name,
                'sampleId': obj.sample.id,
                'barcode': obj.sample.barcode,
                'libraryProtocol': obj.sample.library_protocol.id,
                'libraryProtocolName': obj.sample.library_protocol.name,
                'concentration_sample': obj.sample.concentration,
                'starting_amount': obj.starting_amount,
                'starting_volume': obj.starting_volume,
                'spike_in_description': obj.spike_in_description,
                'spike_in_volume': obj.spike_in_volume,
                'ul_sample': obj.ul_sample,
                'ul_buffer': obj.ul_buffer,
                'indexI7Id': index_i7_id,
                'indexI5Id': index_i5_id,
                'pcr_cycles': obj.pcr_cycles,
                'concentration_library': obj.concentration_library,
                'mean_fragment_size': obj.mean_fragment_size,
                'nM': obj.nM,
                'file':
                    settings.MEDIA_URL + obj.file.name
                    if obj.file
                    else ''
            })
    data = sorted(data, key=lambda x: x['barcode'])
    return JsonResponse({'success': not error, 'error': error, 'data': data})


@login_required
def update(request):
    """ Update a Library Preparation object. """
    error = ''

    try:
        sample_id = request.POST.get('sample_id')
        qc_result = request.POST.get('qc_result')
        obj = LibraryPreparation.objects.get(sample_id=sample_id)
        form = LibraryPreparationForm(request.POST, instance=obj)
    except (ValueError, LibraryPreparation.DoesNotExist) as e:
        error = str(e)
        logger.exception(e)
    else:
        if form.is_valid():
            form.save()

            if qc_result:
                record = Sample.objects.get(pk=sample_id)
                if qc_result == '1':
                    record.status = 3
                    record.save(update_fields=['status'])

                    # Create Pooling object
                    pooling_obj = Pooling(sample=record)
                    # TODO: update field Concentration C1
                    pooling_obj.save()
                else:
                    record.status = -1
                    record.save(update_fields=['status'])

                    # TODO@me: send email
        else:
            error = str(form.errors)
            logger.debug(form.errors)

    return JsonResponse({'success': not error, 'error': error})


def update_all(request):
    """ Update a field in all records (apply to all). """
    error = ''

    if request.is_ajax():
        data = json.loads(request.body)
        for item in data:
            try:
                sample_id = item['sample_id']
                obj = LibraryPreparation.objects.get(sample_id=sample_id)
                changed_value = item['changed_value']
                if changed_value:
                    for k, v in changed_value.items():
                        setattr(obj, k, v)
                    obj.save(update_fields=list(changed_value.keys()))

            except Exception as e:
                error = 'Some of the libraries were not updated ' + \
                    '(see the logs).'
                logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@csrf_exempt
@login_required
def download_benchtop_protocol(request):
    """ Generate Benchtop Protocol as XLS file for selected samples. """
    # response = HttpResponse(content_type='application/vnd.ms-excel')
    response = HttpResponse(content_type='application/ms-excel')
    params = request.POST.getlist('params')
    samples = json.loads(request.POST.get('samples'))

    filename = 'Benchtop_Protocol.xls'
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename

    wb = Workbook(encoding='utf-8')
    ws = wb.add_sheet('Benchtop Protocol')
    col_letters = {
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'D',
        4: 'E',
        5: 'F',
        6: 'G',
        7: 'H',
        8: 'I',
        9: 'J',
    }

    try:
        params = ['Sample'] + params
        row_num = 0

        font_style = XFStyle()
        font_style.font.bold = True

        for i, column in enumerate(params):
            ws.write(row_num, i, column, font_style)
            ws.col(i).width = 6500  # Set column width

        font_style = XFStyle()
        font_style.alignment.wrap = 1

        for sample_id in samples:
            obj = LibraryPreparation.objects.get(sample_id=sample_id)
            index_i7_id, index_i5_id = get_indices_ids(obj.sample)
            row_num += 1
            row = [obj.sample.name]

            for param in params:
                if param == 'Barcode':
                    row.append(obj.sample.barcode)
                elif param == 'Concentration Sample (ng/µl)':
                    row.append(obj.sample.concentration)
                elif param == 'Starting Amount (ng)':
                    row.append(obj.starting_amount)
                elif param == 'Starting Volume (ng)':
                    row.append(obj.starting_volume)
                elif param == 'Spike-in Volume (µl)':
                    row.append(obj.spike_in_volume)
                elif param == 'µl Sample':
                    if 'Concentration Sample (ng/µl)' in params and \
                       'Starting Amount (ng)' in params and \
                       obj.sample.concentration and \
                       obj.starting_amount and \
                       obj.sample.concentration > 0 and \
                       obj.ul_sample == obj.starting_amount / \
                       obj.sample.concentration:
                        row_idx = str(row_num + 1)
                        starting_amount_idx = \
                            params.index('Starting Amount (ng)')
                        concentration_idx = \
                            params.index('Concentration Sample (ng/µl)')
                        col_starting_amount = col_letters[starting_amount_idx]
                        col_concentration = col_letters[concentration_idx]

                        # Starting Amount / Concentration Sample
                        formula = col_starting_amount + row_idx + '/' + \
                            col_concentration + row_idx
                        row.append(Formula(formula))
                    else:
                        row.append(obj.ul_sample)
                elif param == 'µl Buffer':
                    if 'Starting Volume (ng)' in params and \
                       'µl Sample' in params and \
                       'Spike-in Volume (µl)' in params and \
                       obj.starting_volume and obj.ul_sample and \
                       obj.spike_in_volume and \
                       obj.ul_buffer == obj.starting_volume - obj.ul_sample - \
                       obj.spike_in_volume:
                        row_idx = str(row_num + 1)
                        starting_volume_idx = \
                            params.index('Starting Volume (ng)')
                        ul_sample_idx = params.index('µl Sample')
                        spike_in_volume_idx = \
                            params.index('Spike-in Volume (µl)')
                        col_starting_volume = col_letters[starting_volume_idx]
                        col_ul_sample = col_letters[ul_sample_idx]
                        col_spike_in_volume = col_letters[spike_in_volume_idx]

                        # Starting Volume - µl Sample - Spike-in Volume
                        formula = col_starting_volume + row_idx + '-' + \
                            col_ul_sample + row_idx + '-' + \
                            col_spike_in_volume + row_idx
                        row.append(Formula(formula))
                    else:
                        row.append(obj.ul_buffer)
                elif param == 'Index I7 ID':
                    row.append(index_i7_id)
                elif param == 'Index I5 ID':
                    row.append(index_i5_id)

            for i, column in enumerate(params):
                ws.write(row_num, i, row[i], font_style)

    except Exception as e:
        logger.exception(e)

    wb.save(response)

    return response


@csrf_exempt
@login_required
def upload_benchtop_protocol(request):
    """
    Upload a file and add it to all samples with a given Library Protocol.
    """
    error = ''

    library_protocol = request.POST.get('library_protocol')

    if request.method == 'POST' and any(request.FILES):
        try:
            # Get all Library Preparation objects with a given Library Protocol
            objects = LibraryPreparation.objects.filter(
                sample__sample_protocol_id=library_protocol
            )

            # Attach the file to the objects
            for obj in objects:
                obj.file = request.FILES.get('file')
                obj.save()

        except Exception as e:
            error = str(e)
            logger.debug(error)

    return JsonResponse({'success': not error, 'error': error})
