from django.http import HttpResponse
from request.models import Request, RequestForm
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
        print('[ERROR]: get_requests/: %s' % error)
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
        if request.method == 'POST':
            form = RequestForm(request.POST)
            if form.is_valid():
                req = form.save()
                libraries = json.loads(request.POST.get('libraries'))
                samples = json.loads(request.POST.get('samples'))

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
            else:
                error = 'Form is invalid'
                print('[ERROR]: add_request/: %s' % form.errors.as_data())
                logger.debug(form.errors.as_data())
    except Exception as e:
        error = str(e)
        print('[ERROR]: add_request/: %s' % error)
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

    try:
        if request.method == 'POST':
            form = RequestForm(request.POST)
            if form.is_valid():
                form.save()
            else:
                error = 'Form is invalid'
                print('[ERROR]: add_request/: %s' % form.errors.as_data())
                logger.debug(form.errors.as_data())
    except Exception as e:
        error = str(e)
        print('[ERROR]: edit_request/: %s' % error)
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
        print('[ERROR]: delete_request/: %s' % error)
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
        print('[ERROR]: get_libraries_in_request/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data,
        }),
        content_type='application/json',
    )
