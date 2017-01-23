from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from library_sample_shared.models import IndexI7, IndexI5
from sample.models import Sample
from pooling.models import Pooling
from .models import LibraryPreparation
from .forms import LibraryPreparationForm

import logging
import json
import xlwt

logger = logging.getLogger('db')


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
            index_i7 = IndexI7.objects.get(
                index=obj.sample.index_i7,
                index_type_id=obj.sample.index_type_id
            )
            index_i7_id = index_i7.index_id

            try:
                index_i5 = IndexI5.objects.get(
                    index=obj.sample.index_i5,
                    index_type_id=obj.sample.index_type_id
                )
                index_i5_id = index_i5.index_id
            except IndexI5.DoesNotExist:
                index_i5_id = ''

            data.append({
                'active': False,
                'name': obj.sample.name,
                'sampleId': obj.sample.id,
                'barcode': obj.sample.barcode,
                'libraryProtocol': obj.sample.sample_protocol.id,
                'libraryProtocolName': obj.sample.sample_protocol.name,
                'concentrationSample': obj.sample.concentration,
                'startingAmount': obj.starting_amount,
                'startingVolume': obj.starting_volume,
                'spikeInDescription': obj.spike_in_description,
                'spikeInVolume': obj.spike_in_volume,
                'ulSample': obj.ul_sample,
                'ulBuffer': obj.ul_buffer,
                'indexI7Id': index_i7_id,
                'indexI5Id': index_i5_id,
                'pcrCycles': obj.pcr_cycles,
                'concentrationLibrary': obj.concentration_library,
                'meanFragmentSize': obj.mean_fragment_size,
                'nM': obj.nM,
                'file':
                    settings.MEDIA_URL + obj.file.name
                    if obj.file
                    else ''
            })

    return JsonResponse({'success': not error, 'error': error, 'data': data})


@login_required
def edit(request):
    """ Edit Library Preparation object. """
    error = ''

    try:
        sample_id = request.POST.get('sample_id')
        qc_result = request.POST.get('qc_result')
        obj = LibraryPreparation.objects.get(sample_id=sample_id)
        form = LibraryPreparationForm(request.POST, instance=obj)
    except (ValueError, LibraryPreparation.DoesNotExist) as e:
         error = str(e)
         logger.exception(e)

    if form:
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

    wb = xlwt.Workbook(encoding='utf-8')
    ws = wb.add_sheet('Benchtop Protocol')

    try:
        params = ['Sample'] + params
        row_num = 0

        font_style = xlwt.XFStyle()
        font_style.font.bold = True

        for i, column in enumerate(params):
            ws.write(row_num, i, column, font_style)
            ws.col(i).width = 6500  # Set column width

        font_style = xlwt.XFStyle()
        font_style.alignment.wrap = 1

        for sample_id in samples:
            obj = LibraryPreparation.objects.get(sample_id=sample_id)
            row_num += 1
            row = [obj.sample.name]

            for param in params:
                if param == 'Concentration Sample (ng/µl)':
                    row.append(obj.sample.concentration)
                elif param == 'Starting Amount (ng)':
                    row.append(obj.starting_amount)
                elif param == 'Starting Volume (ng)':
                    row.append(obj.starting_volume)
                elif param == 'Spike-in Volume (µl)':
                    row.append(obj.spike_in_volume)
                elif param == 'µl Sample':
                    row.append(obj.ul_sample)
                elif param == 'µl Buffer':
                    row.append(obj.ul_buffer)

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
    Upload a file and add it to all samples with a givel Library Protocol.
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
