from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Prefetch

from request.models import Request
from library_sample_shared.models import IndexI7, IndexI5
from library.models import Library
from sample.models import Sample
from library_preparation.models import LibraryPreparation
from pooling.models import Pooling
from .models import Pool
from .index_generator import IndexGenerator

import logging
import json

logger = logging.getLogger('db')


@login_required
def pooling_tree(request):
    """ Get libraries ready for pooling. """
    children = []

    requests = Request.objects.prefetch_related(
        Prefetch(
            'libraries',
            queryset=Library.objects.filter(status=2),
            to_attr='libraries_all',
        ),
        Prefetch(
            'samples',
            queryset=Sample.objects.filter(status=2),
            to_attr='samples_all',
        ),
    )

    if not request.user.is_staff:
        requests = requests.filter(user_id=request.user.id)

    for req in requests:
        records = []

        for library in req.libraries_all:
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

                records.append({
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
                    'readLength':
                        library.read_length.id,
                    'readLengthName':
                        library.read_length.name,
                    'iconCls': 'x-fa fa-flask',
                    'checked': False,
                    'leaf': True
                })

        for sample in req.samples_all:
            if sample.is_pooled is False:
                records.append({
                    'text': sample.name,
                    'sampleId': sample.id,
                    'recordType': 'S',
                    'sequencingDepth': sample.sequencing_depth,
                    'libraryProtocolName': sample.library_protocol.name,
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
                    'readLength':
                        sample.read_length.id,
                    'readLengthName':
                        sample.read_length.name,
                    'iconCls': 'x-fa fa-flask',
                    'checked': False,
                    'leaf': True
                })

        if records:
            children.append({
                'text': req.name,
                'expanded': True,
                'iconCls': 'x-fa fa-pencil-square-o',
                'children': records
            })

    data = {
        'text': '.',
        'children': children
    }

    return JsonResponse(data)


@login_required
def save_pool(request):
    """
    Create a pool after generating indices, add libraries and "converted"
    samples to it, update the pool size, and create a Library Preparation
    object and a Pooling object for each added library/sample.
    """
    error = ''

    try:
        library_ids = [id for id in json.loads(request.POST.get('libraries'))]

        samples = [
            sample['sample_id']
            for sample in json.loads(request.POST.get('samples'))
        ]

        pool = Pool(user=request.user)
        pool.save()
        pool.libraries.add(*library_ids)
        pool.samples.add(*samples)

        # Make current libraries not available for repeated pooling
        for library_id in library_ids:
            library = Library.objects.get(pk=library_id)
            library.is_pooled = True
            library.save(update_fields=['is_pooled'])

            # Create Pooling object
            pooling_obj = Pooling(library=library)
            # TODO: update field Concentration C1
            pooling_obj.save()

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
                'index_i7', 'index_i5', 'is_pooled', 'is_converted', 'barcode',
            ])

            # # Create Library Preparation object
            lp_obj = LibraryPreparation(sample=sample)
            lp_obj.save()

            # # Create Pooling object
            # pool_obj = Pooling(sample=sample)
            # # TODO: update field Concentration C1
            # pool_obj.save()

        # Trigger Pool Size update
        pool.save(update_fields=['size'])

    except Exception as e:
        error = str(e)
        logger.exception(error)

    return JsonResponse({'success': not error, 'error': error})


@login_required
def update_read_length(request):
    """ Update Read Length for a given librray or sample. """

    record_type = request.POST.get('record_type')
    record_id = request.POST.get('record_id')
    read_length_id = request.POST.get('read_length_id')

    if record_type == 'L':
        record = Library.objects.get(pk=record_id)
    else:
        record = Sample.objects.get(pk=record_id)
    record.read_length_id = read_length_id
    record.save(update_fields=['read_length'])

    return HttpResponse()


@login_required
def update_index_type(request):
    """ Update Index Type for a given sample. """
    sample_id = request.POST.get('sample_id')
    index_type_id = request.POST.get('index_type_id')

    sample = Sample.objects.get(pk=sample_id)
    sample.index_type_id = index_type_id
    sample.save(update_fields=['index_type_id'])

    return HttpResponse()


@login_required
def generate_indices(request):
    """ Generate indices for given libraries and samples. """
    error = ''
    data = []

    library_ids = json.loads(request.POST.get('libraries', '[]'))
    sample_ids = json.loads(request.POST.get('samples', '[]'))

    try:
        index_generator = IndexGenerator(library_ids, sample_ids)
        data = index_generator.generate()
    except ValueError as e:
        error = str(e)
        logger.debug(e)

    return JsonResponse({'success': not error, 'error': error, 'data': data})
