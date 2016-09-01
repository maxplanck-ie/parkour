from django.http import HttpResponse
from request.models import Request
from researcher.models import Researcher
from library.models import Library, Sample

import json
from datetime import datetime
import logging

logger = logging.getLogger('db')


def get_requests(request):
    """ Get the list of all requests and send it to frontend """
    error = str()
    data = []

    try:
        requests = Request.objects.select_related()
        data = [
            {
                'requestId': req.id,
                'status': req.status,
                'name': req.name,
                'projectType': req.project_type,
                'dateCreated': req.date_created.strftime('%d.%m.%Y'),
                'description': req.description,
                'researcherId': req.researcher_id.id,
                'researcher': '{0} {1}'.format(
                    req.researcher_id.first_name,
                    req.researcher_id.last_name,
                ),
                'termsOfUseAccept': req.terms_of_use_accept
            }
            for req in requests
        ]

    except Exception as e:
        error = str(e)
        print('[ERROR]: get_requests(): %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': sorted(
                data,
                key=lambda x: x['requestId'],
                reverse=True,
            )
        }),
        content_type='application/json',
    )


def add_request(request):
    """ Add new request """
    error = str()

    try:
        status = request.POST.get('status')
        name = request.POST.get('name')
        project_type = request.POST.get('project_type')
        date_created = datetime.now()
        description = request.POST.get('description')
        terms_of_use_accept = bool(request.POST.get('terms_of_use_accept'))
        researcher_id = int(request.POST.get('researcher_id'))
        libraries = json.loads(request.POST.get('libraries'))
        samples = json.loads(request.POST.get('samples'))

        print(samples)

        req = Request(
            status=status,
            name=name,
            project_type=project_type,
            date_created=date_created,
            description=description,
            terms_of_use_accept=terms_of_use_accept,
            researcher_id=Researcher.objects.get(id=researcher_id),
        )
        req.save()

        request_libraries = Library.objects.filter(id__in=libraries)
        for library in request_libraries:
            library.is_in_request = True
            library.save()
        req.libraries.add(*libraries)

        request_samples = Sample.objects.filter(id__in=samples)
        for sample in request_samples:
            sample.is_in_request = True
            sample.save()
        req.samples.add(*samples)

    except Exception as e:
        error = str(e)
        print('[ERROR]: add_request(): %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )


def edit_request(request):
    """ Edit existing request """
    error = str()

    request_id = int(request.POST.get('request_id', 0))
    status = request.POST.get('status', '')
    name = request.POST.get('name', '')
    project_type = request.POST.get('project_type', '')
    description = request.POST.get('description', '')
    terms_of_use_accept = bool(request.POST.get('terms_of_use_accept', ''))
    researcher_id = int(request.POST.get('researcher_id', 0))

    try:
        req = Request.objects.get(id=request_id)
        req.status = status
        req.name = name
        req.project_type = project_type
        req.description = description
        req.terms_of_use_accept = terms_of_use_accept
        req.researcher_id = Researcher.objects.get(id=researcher_id)
        req.save()

    except Exception as e:
        error = str(e)
        print('[ERROR]: edit_request(): %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )


def delete_request(request):
    error = str()

    try:
        request_id = int(request.POST.get('request_id'))
        req = Request.objects.get(id=request_id)
        req.delete()

    except Exception as e:
        error = str(e)
        print('[ERROR]: delete_request(): %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )


def get_libraries_in_request(request):
    """ """
    error = ''
    data = []

    try:
        request_id = request.GET.get('request_id')
        req = Request.objects.get(id=request_id)
        libraries = [
            {
                'name': library.name,
                'recordType': 'L',
                'libraryId': library.id,
            }
            for library in req.libraries.all()
        ]
        samples = [
            {
                'name': sample.name,
                'recordType': 'S',
                'libraryId': sample.id,
            }
            for sample in req.samples.all()
        ]
        data = sorted(
            libraries + samples,
            key=lambda x: (x['recordType'], x['name']),
            reverse=True,
        )

    except Exception as e:
        error = str(e)
        print('[ERROR]: get_libraries_in_request(): %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data,
        }),
        content_type='application/json',
    )
