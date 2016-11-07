from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

from pooling.models import Pool
from pooling.utils import generate
from request.models import Request
from library.models import Library, Sample, IndexI7, IndexI5

import json
import logging

logger = logging.getLogger('db')


@login_required
def get_pooling_tree(request):
    """ Get libraries, ready for pooling. """
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
    """ Save pool. """
    error = ''

    try:
        libraries = json.loads(request.POST.get('libraries'))
        name = '_' + request.user.name.replace(' ', '_')

        if request.user.pi:
            name = request.user.pi.name + name

        pool = Pool(name=name)
        pool.save()
        pool.libraries.add(*libraries)
        pool.name = str(pool.id) + '_' + name
        pool.save()

        # Make current libraries not available for repeated pooling
        for library_id in libraries:
            library = Library.objects.get(id=library_id)
            library.is_pooled = True
            library.save()

    except Exception as e:
        error = str(e)
        print(error)
        logger.exception(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )


def update_sequencing_run_condition(request):
    """ Update Sequencing Run Condition before Index generation. """
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
            'data': data,
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )
