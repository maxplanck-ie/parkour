from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.http import HttpResponse

import json


@login_required
def index(request):
    user = request.user
    return render(request, 'index.html', {
        'DEBUG': settings.DEBUG,
        'USERNAME': '%s' % user.name,
        'USER_IS_STAFF': user.is_staff
    })


def get_navigation_tree(request):
    """ Get main NavigationTree """
    data = {
        "text": ".",
        "children": [
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
            # {
            #     'text': 'Researchers',
            #     'iconCls': 'x-fa fa-user',
            #     'viewType': 'researchers',
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
                'text': 'Pooling',
                'iconCls': 'x-fa fa-sort-amount-desc',
                'expanded': True,
                'selectable': False,
                'children': [
                    {
                        'text': 'Index Generator',
                        'iconCls': 'x-fa fa-sort-amount-desc',
                        'viewType': 'index-generator',
                        'leaf': True
                    },
                    {
                        'text': 'Library Preparation',
                        'iconCls': 'x-fa fa-sort-amount-desc',
                        'viewType': 'library-preparation',
                        'leaf': True
                    },
                    {
                        'text': 'Pooling',
                        'iconCls': 'x-fa fa-sort-amount-desc',
                        # 'viewType': '',
                        'leaf': True
                    }
                ]
            }
        ]
    }

    return HttpResponse(
        json.dumps(data),
        content_type='application/json',
    )
