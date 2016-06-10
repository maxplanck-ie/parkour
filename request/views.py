from django.http import HttpResponse
from request.models import Request

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

    return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                        content_type='application/json')
