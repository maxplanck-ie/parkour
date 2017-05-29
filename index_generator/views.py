import logging
import json

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Prefetch, Q

from request.models import Request
from library_sample_shared.models import IndexI7, IndexI5
from library.models import Library
from sample.models import Sample
from library_preparation.models import LibraryPreparation
from pooling.models import Pooling
from .models import Pool, PoolSize
from .index_generator import IndexGenerator
from .forms import LibraryResetForm, SampleResetForm

logger = logging.getLogger('db')


@login_required
@staff_member_required
def get_all(request):
    """ Get libraries and sample, which are ready for pooling. """
    data = []

    requests = Request.objects.prefetch_related(
        Prefetch(
            'libraries',
            queryset=Library.objects.filter(Q(status=2) | Q(status=-2)),
            to_attr='libraries_all',
        ),
        Prefetch(
            'samples',
            queryset=Sample.objects.filter(Q(status=2) | Q(status=-2)),
            to_attr='samples_all',
        ),
    )

    try:
        for req in requests:
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

                    data.append({
                        'name': library.name,
                        'requestId': req.pk,
                        'requestName': req.name,
                        'libraryId': library.pk,
                        'barcode': library.barcode,
                        'recordType': 'L',
                        'sequencingDepth': library.sequencing_depth,
                        'libraryProtocolName': library.library_protocol.name,
                        'indexI7': library.index_i7,
                        'indexI7Id': index_i7_id,
                        'indexI5Id': index_i5_id,
                        'indexI5': library.index_i5,
                        'index_type': library.index_type.pk,
                        'read_length': library.read_length.pk,
                    })

            for sample in req.samples_all:
                if sample.is_pooled is False:
                    data.append({
                        'name': sample.name,
                        'requestId': req.pk,
                        'requestName': req.name,
                        'sampleId': sample.id,
                        'barcode': sample.barcode,
                        'recordType': 'S',
                        'sequencingDepth': sample.sequencing_depth,
                        'libraryProtocolName': sample.library_protocol.name,
                        'indexI7': '',
                        'indexI7Id': '',
                        'indexI5Id': '',
                        'indexI5': '',
                        'index_type':
                            sample.index_type.pk
                            if sample.index_type is not None
                            else '',
                        'read_length': sample.read_length.pk,
                    })

    except Exception as e:
        logger.exception(e)

    data = sorted(data, key=lambda x: x['barcode'][3:])

    return JsonResponse(data, safe=False)


@login_required
def get_pool_sizes(request):
    """ Get a list of all pool sizes. """
    data = [
        {
            'id': pool_size.pk,
            'name': '%ix%i' % (pool_size.multiplier, pool_size.size),
            'multiplier': pool_size.multiplier,
            'size': pool_size.size,
        }
        for pool_size in PoolSize.objects.all()
    ]
    data = sorted(data, key=lambda x: x['size'] * x['multiplier'])
    return JsonResponse(data, safe=False)


@login_required
@staff_member_required
def save_pool(request):
    """
    Create a pool after generating indices, add libraries and "converted"
    samples to it, update the pool size, and create a Library Preparation
    object and a Pooling object for each added library/sample.
    """
    error = ''

    if request.method == 'POST':
        pool_size_id = request.POST.get('pool_size_id', None)
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

            pool = Pool(user=request.user, size_id=pool_size_id)
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

                # Update Concentration C1
                library_concentration = library.concentration
                mean_fragment_size = library.mean_fragment_size
                if mean_fragment_size > 0:
                    concentration_c1 = \
                        round((library_concentration /
                              (mean_fragment_size * 650)) * 10**6, 2)
                    pooling_obj.concentration_c1 = concentration_c1

                pooling_obj.save()

            # Make current samples not available for repeated pooling
            # and set their Index I7 and Index I5 indices
            for sample in samples:
                smpl = Sample.objects.get(pk=sample['sample_id'])
                idx_i7_id = sample['index_i7_id']
                idx_i5_id = sample['index_i5_id']

                if idx_i7_id == '':
                    raise ValueError('Index I7 is not set for "%s"' % smpl.name)

                index_i7 = IndexI7.objects.get(index_id=idx_i7_id).index
                index_i5 = IndexI5.objects.get(index_id=idx_i5_id).index \
                    if idx_i5_id else ''

                # Update sample fields
                smpl.index_i7 = index_i7
                smpl.index_i5 = index_i5
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
@staff_member_required
def update(request):
    """ Update Read Length and Index Type (in samples only). """
    error = ''

    library_id = request.POST.get('library_id', '')
    sample_id = request.POST.get('sample_id', '')
    record_type = request.POST.get('recordType', '')
    read_length_id = request.POST.get('read_length', '')
    index_type_id = request.POST.get('index_type', '')

    try:
        if record_type == 'L':
            library = Library.objects.get(pk=library_id)
            library.read_length_id = read_length_id
            library.save()
        elif record_type == 'S':
            sample = Sample.objects.get(pk=sample_id)
            sample.read_length_id = read_length_id
            sample.index_type_id = index_type_id
            sample.save()
        else:
            raise ValueError('No Record Type is provided.')

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@login_required
@staff_member_required
def update_all(request):
    """ Update Read Length or Index Type in all records (apply to all). """
    error = ''

    if request.is_ajax():
        data = json.loads(request.body.decode('utf-8'))
        for item in data:
            try:
                record_type = item['record_type']
                library_id = item['library_id']
                sample_id = item['sample_id']
                changed_value = item['changed_value']
                if record_type == 'L':
                    library = Library.objects.get(pk=library_id)
                    for key, value in changed_value.items():
                        if key == 'read_length':
                            setattr(library, key + '_id', value)
                    library.save()
                elif record_type == 'S':
                    sample = Sample.objects.get(pk=sample_id)
                    for key, value in changed_value.items():
                        if hasattr(sample, key):
                            setattr(sample, key + '_id', value)
                    sample.save()
                else:
                    raise ValueError('No Record Type is provided.')

            except Exception as e:
                error = 'Some of the records were not updated ' + \
                    '(see the logs).'
                logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@login_required
@staff_member_required
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


@login_required
@staff_member_required
def reset(request):
    """ Reset all record's values. """
    error = ''
    record_type = request.POST.get('record_type', '')
    record_id = request.POST.get('record_id', '')

    try:
        if record_type == 'L':
            library = Library.objects.get(pk=record_id)
            form = LibraryResetForm(request.POST, instance=library)
            if form.is_valid():
                form.save()
            else:
                error = str(form.errors)

        elif record_type == 'S':
            sample = Sample.objects.get(pk=record_id)
            form = SampleResetForm(request.POST, instance=sample)
            if form.is_valid():
                form.save()
            else:
                error = str(form.errors)

        else:
            raise ValueError('No Record Type is provided.')

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})
