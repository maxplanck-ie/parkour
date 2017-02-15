from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Prefetch

from request.models import Request
from library_sample_shared.models import (ReadLength, IndexType,
                                          IndexI7, IndexI5)
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

    if request.method == 'POST':
        library_ids = [
            library_id
            for library_id in json.loads(request.POST.get('libraries', '[]'))
        ]
        samples = [s for s in json.loads(request.POST.get('samples', '[]'))]
        sample_ids = [sample['sample_id'] for sample in samples]

        try:
            if not any(library_ids) and not any(sample_ids):
                raise ValueError('Neither libraries nor samples have been ' +
                                 'provided.')

            pool = Pool(user=request.user)
            pool.save()
            pool.libraries.add(*library_ids)
            pool.samples.add(*sample_ids)

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
            for sample in samples:
                smpl = Sample.objects.get(pk=sample['sample_id'])

                # Update sample fields
                smpl.index_i7 = sample['index_i7']
                smpl.index_i5 = sample['index_i5']
                smpl.is_pooled = True
                smpl.is_converted = True
                smpl.barcode = smpl.barcode.replace('S', 'L')
                smpl.save()

                # # Create Library Preparation object
                lp_obj = LibraryPreparation(sample=smpl)
                lp_obj.save()

            # Trigger Pool Size update
            pool.save(update_fields=['size'])

        except Exception as e:
            error = str(e) if e.__class__ == ValueError \
                else 'Could not save Pool.'
            logger.exception(error)
    else:
        error = 'Wrong HTTP method.'

    return JsonResponse({'success': not error, 'error': error})


@login_required
def update_read_length(request):
    """ Update Read Length for a given librray or sample. """
    error = ''

    if request.method == 'POST':
        record_type = request.POST.get('record_type', '')
        record_id = request.POST.get('record_id', '')
        read_length_id = request.POST.get('read_length_id', '')

        try:
            if record_type == 'L':
                record = Library.objects.get(pk=record_id)
            elif record_type == 'S':
                record = Sample.objects.get(pk=record_id)
            else:
                raise ValueError('Record type is not L/S or missing.')
            read_length = ReadLength.objects.get(pk=read_length_id)
        except Exception as e:
            error = 'Could not update Read Length.'
            logger.exception(e)
        else:
            record.read_length = read_length
            record.save(update_fields=['read_length'])
    else:
        error = 'Wrong HTTP method.'

    return JsonResponse({'success': not error, 'error': error})


@login_required
def update_index_type(request):
    """ Update Index Type for a given sample. """
    error = ''

    if request.method == 'POST':
        sample_id = request.POST.get('sample_id', '')
        index_type_id = request.POST.get('index_type_id', '')

        try:
            sample = Sample.objects.get(pk=sample_id)
            index_type = IndexType.objects.get(pk=index_type_id)
        except Exception as e:
            error = 'Could not update Index Type.'
            logger.exception(e)
        else:
            sample.index_type = index_type
            sample.save(update_fields=['index_type_id'])
    else:
        error = 'Wrong HTTP method.'

    return JsonResponse({'success': not error, 'error': error})


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
