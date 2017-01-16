from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.http import JsonResponse


@login_required
def index(request):
    user = request.user
    return render(request, 'index.html', {
        'DEBUG': settings.DEBUG,
        'USERNAME': '%s' % user.name,
        'USER_IS_STAFF': user.is_staff
    })


@login_required
def get_navigation_tree(request):
    """ Get main NavigationTree. """

    data = [
        {
            'text': 'Start Page',
            'iconCls': 'x-fa fa-th-large',
            'viewType': 'startpage',
            'leaf': True
        },
        # {
        #     'text': 'Dashboard',
        #     'iconCls': 'x-fa fa-desktop',
        #     'viewType': 'dashboard',
        #     'leaf': True
        # },
        {
            'text': 'Submission',
            'iconCls': 'x-fa fa-tasks',
            'expanded': True,
            'selectable': False,
            'children': [
                {
                    'text': 'Libraries/Samples',
                    'iconCls': 'x-fa fa-flask',
                    'viewType': 'libraries',
                    'leaf': True
                }
            ]
        },
        {
            'text': 'Approval',
            'iconCls': 'x-fa fa-check-square',
            'expanded': True,
            'selectable': False,
            'children': [
                {
                    'text': 'Incoming Libraries/Samples',
                    'iconCls': 'x-fa fa-arrow-down',
                    'viewType': 'incoming-libraries',
                    'leaf': True
                }
            ]
        },
        {
            'text': 'Index Generator',
            'iconCls': 'x-fa fa-cogs',
            'viewType': 'index-generator',
            'leaf': True
        },
        {
            'text': 'Library Preparation',
            'iconCls': 'x-fa fa-table',
            'viewType': 'library-preparation',
            'leaf': True
        },
        {
            'text': 'Pooling',
            'iconCls': 'x-fa fa-sort-amount-desc',
            'viewType': 'pooling',
            'leaf': True
        },
        {
            'text': 'Load Flowcells',
            'iconCls': 'x-fa fa-level-down',
            'viewType': 'load-flowcells',
            'leaf': True
        }
    ]

    # Hide Approval tab for a user
    if not request.user.is_staff:
        index = next(
            index
            for (index, d) in enumerate(data)
            if d['text'] == 'Approval',
        )
        data.pop(index)

    return JsonResponse({'text': '.', 'children': data})
