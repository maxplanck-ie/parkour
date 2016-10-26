from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from request.models import Request

import json


@login_required
def get_pooling_tree(request):
    """ Get libraries, ready for pooling  """
    children = []

    requests = Request.objects.select_related()
    for req in requests:
        libraries = []
        for library in req.libraries.all():
            if library.index_i7 or library.index_i5:
                libraries.append({
                    'text': library.name,
                    'libraryId': library.id,
                    'sequencingDepth': library.sequencing_depth,
                    'indexI7': library.index_i7,
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
