from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from request.models import Request
from index_generator.models import Pool
from library_preparation.models import LibraryPreparation
from library.models import Library
from .models import Pooling
from .forms import PoolingForm

import json
import logging
import xlwt

logger = logging.getLogger('db')


@login_required
def get_request(record, record_type):
    """ Get request for a current library/sample. """

    if record_type == 'L':
        requests = Request.objects.all().prefetch_related('libraries')
        for request in requests:
            records = request.libraries.all()
            if record in records:
                return request
    else:
        requests = Request.objects.all().prefetch_related('samples')
        for request in requests:
            records = request.samples.all()
            if record in records:
                return request


@login_required
def get_all(request):
    """ Get the list of all libraries. """
    error = ''
    data = []

    try:
        pools = Pool.objects.prefetch_related('libraries', 'samples')
        for pool in pools:
            libraries = pool.libraries.all()
            samples = pool.samples.all()

            sum_sequencing_depth = sum([l.sequencing_depth for l in libraries])
            sum_sequencing_depth += sum([s.sequencing_depth for s in samples])
            pool_volume = (len(libraries) + len(samples)) * 10

            # Native libraries
            for library in libraries:
                pooling_obj = Pooling.objects.get(library=library)
                req = get_request(library, 'L')
                percentage_library = \
                    library.sequencing_depth / sum_sequencing_depth
                volume_to_pool = percentage_library * pool_volume

                data.append({
                    'name': library.name,
                    'libraryId': library.id,
                    'barcode': library.barcode,
                    'poolId': pool.id,
                    'poolName': pool.name,
                    'requestId': req.id,
                    'requestName': req.name,
                    'concentration': library.concentration,
                    'meanFragmentSize': library.mean_fragment_size,
                    'sequencingDepth': library.sequencing_depth,
                    'concentrationC1': pooling_obj.concentration_c1,
                    'concentrationC2': pooling_obj.concentration_c2,
                    'sampleVolume': pooling_obj.sample_volume,
                    'bufferVolume': pooling_obj.buffer_volume,
                    'percentageLibrary': round(percentage_library * 100),
                    'volumeToPool': volume_to_pool,
                    'file':
                        settings.MEDIA_URL + pool.file.name
                        if pool.file
                        else ''
                })

            # Converted samples (sample -> library)
            for sample in samples:
                lib_prep_obj = LibraryPreparation.objects.get(sample=sample)
                pooling_obj = Pooling.objects.get(sample=sample)
                req = get_request(sample, 'S')
                percentage_library = \
                    sample.sequencing_depth / sum_sequencing_depth
                volume_to_pool = percentage_library * pool_volume

                data.append({
                    'name': sample.name,
                    'sampleId': sample.id,
                    'barcode': sample.barcode,
                    'poolId': pool.id,
                    'poolName': pool.name,
                    'requestId': req.id,
                    'requestName': req.name,
                    'concentration': lib_prep_obj.concentration_library,
                    'meanFragmentSize': lib_prep_obj.mean_fragment_size,
                    'sequencingDepth': sample.sequencing_depth,
                    'concentrationC1': pooling_obj.concentration_c1,
                    'concentrationC2': pooling_obj.concentration_c2,
                    'sampleVolume': pooling_obj.sample_volume,
                    'bufferVolume': pooling_obj.buffer_volume,
                    'percentageLibrary': round(percentage_library * 100),
                    'volumeToPool': volume_to_pool,
                    'file':
                        settings.MEDIA_URL + pool.file.name
                        if pool.file
                        else ''
                })

    except Exception as e:
        error = str(e)
        logger.exception(error)

    return JsonResponse({
        'success': not error,
        'error': error,
        'data': data
    })


@login_required
def edit(request):
    """ Edit a record. """
    error = ''

    library_id = int(request.POST.get('library_id'))
    sample_id = int(request.POST.get('sample_id'))
    concentration = float(request.POST.get('concentration'))

    try:
        if library_id == 0:
            obj = Pooling.objects.get(sample_id=sample_id)

            # Update concentration value
            lib_prep_obj = LibraryPreparation.objects.get(sample_id=sample_id)
            lib_prep_obj.concentration_library = concentration
            lib_prep_obj.save(update_fields=['concentration_library'])
        else:
            obj = Pooling.objects.get(library_id=library_id)

            # Update concentration value
            library = Library.objects.get(pk=library_id)
            library.concentration = concentration
            library.save(update_fields=['concentration'])

        form = PoolingForm(request.POST, instance=obj)

        if form.is_valid():
            form.save()
        else:
            for key, value in form.errors.items():
                error += '%s: %s<br/>' % (key, value)

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({
        'success': not error,
        'error': error
    })


@csrf_exempt
@login_required
def download_pooling_template(request):
    response = HttpResponse(content_type='application/ms-excel')
    libraries = json.loads(request.POST.get('libraries'))
    samples = json.loads(request.POST.get('samples'))

    filename = 'QC_Normalization_and_Pooling_Template.xls'
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename

    wb = xlwt.Workbook(encoding='utf-8')
    ws = wb.add_sheet('QC Normalization and Pooling')

    try:
        columns = (
            'Library',
            'Barcode',
            'ng/µl',
            'bp',
            'nM',
            'Date',
            'Comments',
        )
        row_num = 0

        font_style = xlwt.XFStyle()
        font_style.font.bold = True

        for i, column in enumerate(columns):
            ws.write(row_num, i, column, font_style)
            ws.col(i).width = 6500  # Set column width

        font_style = xlwt.XFStyle()
        font_style.alignment.wrap = 1

        for library_id in libraries:
            obj = Pooling.objects.get(library_id=library_id)
            row_num += 1
            row = [obj.library.name, obj.library.barcode]
            for i in range(2):
                ws.write(row_num, i, row[i], font_style)

        for sample_id in samples:
            obj = Pooling.objects.get(sample_id=sample_id)
            row_num += 1
            row = [obj.sample.name, obj.sample.barcode]
            for i in range(2):
                ws.write(row_num, i, row[i], font_style)

    except Exception as e:
        logger.exception(e)

    wb.save(response)

    return response


@csrf_exempt
@login_required
def upload_pooling_template(request):
    """ Upload a file and attach it to a given Pool. """
    pool_name = request.POST.get('pool_name')

    if request.method == 'POST' and any(request.FILES):
        pool = Pool.objects.get(name=pool_name)
        pool.file = request.FILES.get('file')
        pool.save()
        success = True
    else:
        success = False

    return JsonResponse({'success': success})
