from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

from pooling.models import Pool
from request.models import Request
from library.models import Library, IndexType, IndexI7, IndexI5

import json
import logging

logger = logging.getLogger('db')


@login_required
def get_pooling_tree(request):
    """ Get libraries, ready for pooling  """
    children = []

    requests = Request.objects.select_related()
    for req in requests:
        libraries = []
        for library in req.libraries.all():
            if (library.index_i7 or library.index_i5) \
                    and library.is_pooled is False:

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
    """ Save pool  """
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
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )
