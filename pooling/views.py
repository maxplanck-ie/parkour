from django.conf import settings
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from pooling.models import Pool, LibraryPreparation, LibraryPreparationForm, \
    LibraryPreparationFile, Pooling, PoolingForm, PoolFile
from pooling.utils import generate
from request.models import Request
from library.models import Library, Sample, IndexI7, IndexI5

import json
import logging
import xlwt

logger = logging.getLogger('db')


@login_required
def get_pooling_tree(request):
    """ Get libraries ready for pooling. """
    children = []

    requests = Request.objects.select_related()
    for req in requests:
        libraries = []
        for library in req.libraries.all():
            if library.index_i7 and library.is_pooled is False:

                index_i7 = IndexI7.objects.filter(
                    index=library.index_i7,
                    index_type=library.index_type
                )
                index_i7_id = index_i7[0].index_id if index_i7 else ''

                index_i5 = IndexI5.objects.filter(
                    index=library.index_i5,
                    index_type=library.index_type
                )
                index_i5_id = index_i5[0].index_id if index_i5 else ''

                libraries.append({
                    'text': library.name,
                    'libraryId': library.id,
                    'recordType': 'L',
                    'sequencingDepth': library.sequencing_depth,
                    'libraryProtocolName': library.library_protocol.name,
                    'indexI7': library.index_i7,
                    'indexI7Id': index_i7_id,
                    'indexI5Id': index_i5_id,
                    'indexI5': library.index_i5,
                    'indexType': library.index_type.id,
                    'indexTypeName': library.index_type.name,
                    'sequencingRunCondition':
                        library.sequencing_run_condition.id,
                    'sequencingRunConditionName':
                        library.sequencing_run_condition.name,
                    'iconCls': 'x-fa fa-flask',
                    'checked': False,
                    'leaf': True
                })

        for sample in req.samples.all():
            if sample.is_pooled is False:
                libraries.append({
                    'text': sample.name,
                    'sampleId': sample.id,
                    'recordType': 'S',
                    'sequencingDepth': sample.sequencing_depth,
                    'libraryProtocolName': sample.sample_protocol.name,
                    'indexI7': '',
                    'indexI7Id': '',
                    'indexI5Id': '',
                    'indexI5': '',
                    'indexType':
                        sample.index_type.id
                        if sample.index_type is not None
                        else '',
                    'indexTypeName':
                        sample.index_type.name
                        if sample.index_type is not None
                        else '',
                    'sequencingRunCondition':
                        sample.sequencing_run_condition.id,
                    'sequencingRunConditionName':
                        sample.sequencing_run_condition.name,
                    'iconCls': 'x-fa fa-flask',
                    'checked': False,
                    'leaf': True
                })

        if libraries:
            children.append({
                'text': req.name,
                'expanded': True,
                'iconCls': 'x-fa fa-pencil-square-o',
                'children': libraries
            })

    data = {
        'text': '.',
        'children': children
    }

    return HttpResponse(
        json.dumps(data),
        content_type='application/json',
    )


@login_required
def save_pool(request):
    """
    Create a pool after generating indices, add libraries and "converted"
    samples to it, update the pool size, and create a Library Preparation
    object and a Pooling object for each added library/sample.
    """
    error = ''

    try:
        libraries = [
            library_id
            for library_id in json.loads(request.POST.get('libraries'))
        ]

        samples = [
            sample['sample_id']
            for sample in json.loads(request.POST.get('samples'))
        ]

        name = '_' + request.user.name.replace(' ', '_')

        if request.user.pi:
            name = '_' + request.user.pi.name + name

        pool = Pool(name=name)
        pool.save()
        pool.libraries.add(*libraries)
        pool.samples.add(*samples)
        pool.name = str(pool.id) + name

        # Make current libraries not available for repeated pooling
        for library_id in libraries:
            library = Library.objects.get(pk=library_id)
            library.is_pooled = True
            library.save(update_fields=['is_pooled'])

            # Update Pool Size
            pool.size += library.sequencing_depth
            pool.save(update_fields=['size'])

            # Create Pooling object
            pool_obj = Pooling(library=library)
            #  TODO: update field Concentration C1
            pool_obj.save()

        # Make current samples not available for repeated pooling
        # and set their Index I7 and Index I5 indices
        for smpl in json.loads(request.POST.get('samples')):
            sample = Sample.objects.get(id=smpl['sample_id'])

            # Update sample fields
            sample.index_i7 = smpl['index_i7']
            sample.index_i5 = smpl['index_i5']
            sample.is_pooled = True
            sample.is_converted = True
            sample.barcode = sample.barcode.replace('S', 'L')
            sample.save(update_fields=[
                'index_i7', 'index_i5', 'is_pooled', 'is_converted', 'barcode'
            ])

            # Update Pool Size
            pool.size += sample.sequencing_depth
            pool.save(update_fields=['size'])

            # Create Library Preparation object
            lp_obj = LibraryPreparation(sample=sample)
            lp_obj.save()

            # Create Pooling object
            pool_obj = Pooling(sample=sample)
            #  TODO: update field Concentration C1
            pool_obj.save()

        pool.save()

    except Exception as e:
        error = str(e)
        logger.exception(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error
        }),
        content_type='application/json',
    )


def update_sequencing_run_condition(request):
    """ Update Sequencing Run Condition before index generation. """
    record_type = request.POST.get('record_type')
    record_id = request.POST.get('record_id')
    sequencing_run_condition_id = \
        request.POST.get('sequencing_run_condition_id')

    if record_type == 'L':
        record = Library.objects.get(id=record_id)
    else:
        record = Sample.objects.get(id=record_id)
    record.sequencing_run_condition_id = sequencing_run_condition_id
    record.save()

    return HttpResponse(content_type='application/json')


def update_index_type(request):
    """ Update Index Type for a given sample. """
    sample_id = request.POST.get('sample_id')
    index_type_id = request.POST.get('index_type_id')
    sample = Sample.objects.get(id=sample_id)
    sample.index_type_id = index_type_id
    sample.save()
    return HttpResponse(content_type='application/json')


def generate_indices(request):
    """ Generate indices for libraries and samples. """
    error = ''
    data = []

    try:
        library_ids = json.loads(request.POST.get('libraries'))
        sample_ids = json.loads(request.POST.get('samples'))
        generated_indices = generate(library_ids, sample_ids)

        for record in sorted(generated_indices, key=lambda x: x['name']):
            index_i7 = record['predicted_index_i7']['index']
            index_i5 = record['predicted_index_i5']['index']

            rec = {
                'name': record['name'],
                'sequencingDepth': record['depth'],
                'sequencingRunCondition': record['read_length'],
                'indexI7': index_i7,
                'indexI7Id': record['predicted_index_i7']['index_id'],
                'indexI5': index_i5,
                'indexI5Id': record['predicted_index_i5']['index_id']
            }

            if 'sample_id' in record.keys():
                rec.update({
                    'recordType': 'S',
                    'sampleId': record['sample_id']
                })

            if 'library_id' in record.keys():
                rec.update({
                    'recordType': 'L',
                    'libraryId': record['library_id']
                })

            for i in range(len(index_i7)):
                rec.update({'indexI7_' + str(i + 1): rec['indexI7'][i]})

            for i in range(len(index_i5)):
                rec.update({'indexI5_' + str(i + 1): rec['indexI5'][i]})

            data.append(rec)

    except Exception as e:
        error = str(e)
        print(error)
        logger.exception(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data
        }),
        content_type='application/json',
    )


def get_library_preparation(request):
    """ Get the list of samples for Library Preparation. """
    error = ''
    data = []

    try:
        for obj in LibraryPreparation.objects.all():
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
                    settings.MEDIA_URL + obj.file.file.name
                    if obj.file
                    else ''
            })

    except Exception as e:
        error = str(e)
        print(error)
        logger.exception(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data
        }),
        content_type='application/json',
    )


def edit_library_preparation(request):
    """ Edit sample in the Library Preparation step. """
    error = ''

    sample_id = request.POST.get('sample_id')
    obj = LibraryPreparation.objects.get(sample_id=sample_id)

    try:
        form = LibraryPreparationForm(request.POST, instance=obj)

        if form.is_valid():
            form.save()
        else:
            for key, value in form.errors.items():
                error += '%s: %s<br/>' % (key, value)

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error
        }),
        content_type='application/json',
    )


@csrf_exempt
@login_required
def download_benchtop_protocol_xls(request):
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
def upload_library_preparation_file(request):
    """
    Upload a file and add it to all samples with a givel Library Protocol.
    """
    error = ''

    if request.method == 'POST' and any(request.FILES):
        try:
            library_protocol = request.POST.get('library_protocol')
            uploaded_file = LibraryPreparationFile(
                file=request.FILES.get('file')
            )
            uploaded_file.save()

            # Get all LibraryPreparation objects with a givenLibrary Protocol
            objects = LibraryPreparation.objects.filter(
                sample__sample_protocol_id=library_protocol
            )

            # Attach the file to the objects
            for obj in objects:
                obj.file = uploaded_file
                obj.save()

        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error
        }),
        content_type='application/json',
    )


def get_request(record, record_type):
    """ Get request for current library/sample. """

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


def get_pooling(request):
    """ Get the list of libraries for Pooling. """
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
                        settings.MEDIA_URL + pool.file.file.name
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
                        settings.MEDIA_URL + pool.file.file.name
                        if pool.file
                        else ''
                })

    except Exception as e:
        error = str(e)
        print(error)
        logger.exception(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data
        }),
        content_type='application/json',
    )


@csrf_exempt
@login_required
def download_pooling_template_xls(request):
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
    error = ''
    pool_name = request.POST.get('pool_name')

    if request.method == 'POST' and any(request.FILES):
        try:
            pool = Pool.objects.get(name=pool_name)

            uploaded_file = PoolFile(
                file=request.FILES.get('file')
            )
            uploaded_file.save()

            # Attach the uploaded file to the pool
            pool.file = uploaded_file
            pool.save()

        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error
        }),
        content_type='application/json',
    )


def edit_pooling(request):
    """ Edit a record in the Pooling step. """
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
            lib_prep_obj.save()
        else:
            obj = Pooling.objects.get(library_id=library_id)

            # Update concentration value
            library = Library.objects.get(id=library_id)
            library.concentration = concentration
            library.save()

        form = PoolingForm(request.POST, instance=obj)

        if form.is_valid():
            form.save()
        else:
            for key, value in form.errors.items():
                error += '%s: %s<br/>' % (key, value)

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error
        }),
        content_type='application/json',
    )
