from django.http import HttpResponse
from request.models import Request
from researcher.models import Researcher

import json


def get_requests(request):
    """ Get the list of all requests and send it to frontend """
    error = str()
    data = []

    try:
        requests = Request.objects.all()
        data = [{
            'requestId': req.id,
            'status': req.status,
            'name': req.name,
            'projectType': req.project_type,
            'dateCreated': req.date_created.strftime('%d.%m.%Y'),
            'description': req.description,
            'researcherId': req.researcher_id.id,
            'researcher': '{0} {1}'.format(req.researcher_id.first_name, req.researcher_id.last_name),
            'termsOfUseAccept': req.terms_of_use_accept
                } for req in requests]
    except Exception as e:
        print('[ERROR]: add_researcher():', e)
        error = str(e)

    return HttpResponse(json.dumps({'success': not error, 'error': error,
                                    'data': sorted(data, key=lambda x: x['requestId'])}),
                        content_type='application/json')


def edit_request(request):
    """ Edit existing request """
    error = str()

    request_id = int(request.POST.get('request_id', 1))
    status = request.POST.get('status', '')
    name = request.POST.get('name', '')
    description = request.POST.get('description', '')
    terms_of_use_accept = bool(request.POST.get('terms_of_use_accept', ''))
    researcher_id = int(request.POST.get('researcher_id', 1))

    try:
        req = Request.objects.get(id=request_id)
        req.status = status
        req.name = name
        req.description = description
        req.terms_of_use_accept = terms_of_use_accept
        req.researcher_id = Researcher.objects.get(id=researcher_id)
        req.save()
    except Exception as e:
        print('[ERROR]: edit_request():', e)
        error = str(e)

    return HttpResponse(json.dumps({'success': not error, 'error': error}), content_type='application/json')
