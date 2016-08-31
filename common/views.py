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
        'USERNAME': '%s %s' % (user.first_name, user.last_name)
        if user.first_name else user.username
    })


def get_navigation_tree(request):
    """ """
    error = ''

    data = [{
        'text': 'Submission',
        'iconCls': 'x-fa fa-tasks',
        'expanded': True,
        'selectable': False,
        'children': []
    }]

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'root': data,
        }),
        content_type='application/json',
    )
