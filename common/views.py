from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.conf import settings

import json


@login_required
def index(request):
    return render(request, 'index.html', {'DEBUG': settings.DEBUG})


@login_required
def get_username(request):
    user = request.user
    data = {'username': user.first_name + ' ' + user.last_name}
    return HttpResponse(json.dumps({'data': data}), content_type='application/json')
