from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from .models import Request
from .forms import RequestForm

import json
from datetime import datetime
import logging

import pdfkit

User = get_user_model()
logger = logging.getLogger('db')


@login_required
def get_all(request):
    """ Get the list of all requests. """

    if request.user.is_staff:
        requests = Request.objects.prefetch_related(
            'user', 'libraries', 'samples'
        )
    else:
        requests = Request.objects.filter(
            user_id=request.user.id
        ).prefetch_related('user', 'libraries', 'samples')

    data = [
        {
            'requestId': req.id,
            'name': req.name,
            'dateCreated': req.date_created.strftime('%d.%m.%Y'),
            'description': req.description,
            'researcherId': req.user.id,
            'researcher': req.user.get_full_name(),
            'deepSeqRequestName':
                req.deep_seq_request.name.split('/')[-1]
                if req.deep_seq_request else '',
            'deepSeqRequestPath':
                settings.MEDIA_URL + req.deep_seq_request.name
                if req.deep_seq_request else '',
            'sumSeqDepth': sum([
                l.sequencing_depth
                for l in list(req.libraries.all()) + list(req.samples.all())
            ])
        }
        for req in sorted(requests, key=lambda x: x.date_created, reverse=True)
    ]

    return JsonResponse(data, safe=False)


@login_required
def get_libraries_and_samples(request):
    """ Get the list of all libraries and samples in a given request. """
    request_id = request.GET.get('request_id')
    req = Request.objects.get(id=request_id)

    libraries = [
        {
            'name': library.name,
            'recordType': library.get_record_type(),
            'libraryId': library.id,
            'barcode': library.barcode,
        }
        for library in req.libraries.all()
    ]

    samples = [
        {
            'name': sample.name,
            'recordType': sample.get_record_type(),
            'sampleId': sample.id,
            'barcode': sample.barcode,
        }
        for sample in req.samples.all()
    ]

    data = sorted(libraries + samples, key=lambda x: x['barcode'])

    return JsonResponse({'success': True, 'data': data})


@login_required
def save_request(request):
    """ Add new or edit an existing request """
    error = str()
    form = None

    mode = request.POST.get('mode')
    request_id = request.POST.get('request_id')

    if mode == 'add':
        form = RequestForm(request.POST)
    else:
        try:
            req = Request.objects.get(id=request_id)
            form = RequestForm(request.POST, instance=req)
        except (ValueError, Request.DoesNotExist) as e:
            error = str(e)
            logger.exception(e)

    if form:
        if form.is_valid():
            if mode == 'add':
                req = form.save(commit=False)
                req.user = request.user
                req.save()
            else:
                req = form.save()

            library_ids = request.POST.get('libraries')
            sample_ids = request.POST.get('samples')

            if library_ids:
                libraries = json.loads(library_ids)
                req.libraries.add(*libraries)

            if sample_ids:
                samples = json.loads(sample_ids)
                req.samples.add(*samples)

            if not library_ids and not sample_ids:
                error = 'Please provide Libraries and/or samples.'
        else:
            error = str(form.errors)
            logger.debug(form.errors)

    return JsonResponse({'success': not error, 'error': error})


@login_required
def delete_request(request):
    """ Delete request with all its libraries and samples. """
    error = ''
    request_id = request.POST.get('request_id', '')

    try:
        req = Request.objects.get(pk=request_id)
        req.delete()
    except (ValueError, Request.DoesNotExist) as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@csrf_exempt
@login_required
def generate_deep_sequencing_request(request):
    """ Generate Deep Sequencing Request form in PDF. """
    request_id = request.POST.get('request_id', '')

    try:
        req = Request.objects.get(pk=request_id)
        user = User.objects.get(id=req.user.id)
        cost_unit = ','.join(sorted([u.name for u in user.cost_unit.all()]))

        libraries = [
            {
                'name': library.name,
                'type': 'Library',
                'barcode': library.barcode,
            }
            for library in req.libraries.all()
        ]

        samples = [
            {
                'name': sample.name,
                'type': 'Sample',
                'barcode': sample.barcode,
            }
            for sample in req.samples.all()
        ]

        records = sorted(libraries + samples, key=lambda x: x['barcode'])

        html = render_to_string('deepseq_request_pdf.html', {
            'request_name': req.name,
            'date': datetime.now().strftime('%d.%m.%Y'),
            'user': user.get_full_name(),
            'phone': user.phone if user.phone else '',
            'email': user.email,
            'organization': user.organization.name if user.organization else '',
            'cost_unit': cost_unit,
            'description': req.description,
            'records': records,
        })

        pdf = pdfkit.from_string(html, False, options=settings.PDF_OPTIONS)

        # Generate response
        filename = req.name + '_Deep_Sequencing_Request.pdf'
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="%s"' % filename

    except (Request.DoesNotExist, ValueError) as e:
        logger.exception(e)
        response = JsonResponse({'success': False})

    return response


@csrf_exempt
@login_required
def upload_deep_sequencing_request(request):
    """
    Upload Deep Sequencing request with PI's signature and
    change request status to 1.
    """
    error = ''
    file_name = ''
    file_path = ''

    request_id = request.POST.get('request_id')

    if any(request.FILES):
        try:
            req = Request.objects.get(pk=request_id)
            req.deep_seq_request = request.FILES.get('file')
            req.save()

            file_name = req.deep_seq_request.name.split('/')[-1]
            file_path = settings.MEDIA_URL + req.deep_seq_request.name

            libraries = req.libraries.all()
            samples = req.samples.all()

            # Set statuses to 1
            for library in libraries:
                library.status = 1
                library.save(update_fields=['status'])

            for sample in samples:
                sample.status = 1
                sample.save(update_fields=['status'])

        except (ValueError, Request.DoesNotExist) as e:
            error = str(e)
            logger.exception(e)
    else:
        error = 'File is missing.'

    return JsonResponse({
        'success': not error,
        'error': error,
        'name': file_name,
        'path': file_path
    })
