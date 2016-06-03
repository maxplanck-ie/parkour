from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse

import json


@login_required
def index(request):
    return render(request, 'index.html')


def get_username(request):
    user = request.user
    data = {}

    if user.is_authenticated():
        data['username'] = user.first_name + ' ' + user.last_name
    else:
        pass

    return HttpResponse(json.dumps({'data': data}), content_type='application/json')
