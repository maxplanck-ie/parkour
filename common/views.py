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
        'USERNAME': '%s' % user.name
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
                        'text': 'Requests',
                        'iconCls': 'x-fa fa-external-link-square',
                        'viewType': 'requests',
                        'leaf': True
                    },
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
                        'iconCls': 'x-fa fa-check',
                        'viewType': 'incoming-libraries',
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
