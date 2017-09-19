import json
import logging
from datetime import datetime
from unicodedata import normalize

import pdfkit

from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.template.loader import render_to_string
from django.core.mail import send_mail

from .models import Request, FileRequest
from .forms import RequestForm

User = get_user_model()
logger = logging.getLogger('db')


@login_required
def get_all(request):
    """ Get the list of all requests. """
    data = []
    restrict_permissions = False

    if request.user.is_staff:
        requests = Request.objects.prefetch_related(
            'user', 'libraries', 'samples'
        )
    else:
        requests = Request.objects.filter(
            user_id=request.user.pk
        ).prefetch_related('user', 'libraries', 'samples')

    for req in requests:
        records = list(req.libraries.values('status', 'sequencing_depth')) + \
            list(req.samples.values('status', 'sequencing_depth'))
        statuses = [r['status'] for r in records]

        # Don't allow the user to modify the requests and libraries/samples
        # if they have reached status 1 or higher (or failed)
        if not request.user.is_staff and statuses.count(0) == 0:
            restrict_permissions = True

        # Hide those Requests, whose libraries/samples
        # have reached status 6 (for admins only)
        if request.user.is_staff and statuses.count(6) > 0:
            continue

        data.append({
            'requestId': req.pk,
            'name': req.name,
            'restrictPermissions': restrict_permissions,
            'dateCreated': req.date_created.strftime('%d.%m.%Y'),
            'description': req.description,
            'userId': req.user.pk,
            'user': req.user.get_full_name(),
            'files': [file.pk for file in req.files.all()],
            'deepSeqRequestName':
                req.deep_seq_request.name.split('/')[-1]
                if req.deep_seq_request else '',
            'deepSeqRequestPath':
                settings.MEDIA_URL + req.deep_seq_request.name
                if req.deep_seq_request else '',
            'sumSeqDepth': sum([r['sequencing_depth'] for r in records])
        })

    data = sorted(data, key=lambda x: x['requestId'], reverse=True)

    return JsonResponse(data, safe=False)


@login_required
def get_libraries_and_samples(request):
    """ Get the list of all libraries and samples for a given request. """
    request_id = request.GET.get('request_id')
    req = Request.objects.get(id=request_id)

    libraries = [
        {
            'name': library.name,
            'recordType': library.get_record_type(),
            'libraryId': library.pk,
            'barcode': library.barcode,
        }
        for library in req.libraries.all()
    ]

    samples = [
        {
            'name': sample.name,
            'recordType': sample.get_record_type(),
            'sampleId': sample.pk,
            'barcode': sample.barcode,
            'is_converted': sample.is_converted,
        }
        for sample in req.samples.all()
    ]

    data = sorted(libraries + samples, key=lambda x: x['barcode'][3:])

    return JsonResponse({'success': True, 'data': data})


@login_required
def save_request(request):
    """ Add new or edit an existing request """
    error = ''

    request_id = request.POST.get('request_id', '')
    libraries = json.loads(request.POST.get('libraries', '[]'))
    samples = json.loads(request.POST.get('samples', '[]'))
    files = json.loads(request.POST.get('files', '[]'))

    try:
        if request.method != 'POST':
            raise ValueError('Wrong HTTP method.')

        mode = request.POST.get('mode')
        if mode == 'add':
            form = RequestForm(request.POST)
        elif mode == 'edit':
            req = Request.objects.get(id=request_id)
            form = RequestForm(request.POST, instance=req)
        else:
            raise ValueError('Wrong or missing mode.')

        if not libraries and not samples:
            raise ValueError('Please provide Libraries and/or Samples.')

        if form.is_valid():
            if mode == 'add':
                req = form.save(commit=False)
                req.user = request.user
                req.save()
                req.files.add(*files)
            else:
                req = form.save()
                old_files = [file for file in req.files.all()]
                req.files.clear()
                req.save()

                if not files:
                    files_to_delete = old_files  # delete all files
                else:
                    req.files.add(*files)
                    new_files = [file for file in req.files.all()]
                    files_to_delete = list(set(old_files) - set(new_files))

                # Delete files
                for file in files_to_delete:
                    file.delete()

            req.libraries.add(*libraries)
            req.samples.add(*samples)

        else:
            error = str(form.errors)

    except Exception as e:
        error = str(e)
        logger.exception(e)

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
        organization = user.organization.name if user.organization else ''

        libraries = [
            {
                'name': library.name,
                'type': 'Library',
                'barcode': library.barcode,
                'sequencing_depth': library.sequencing_depth,
            }
            for library in req.libraries.all()
        ]

        samples = [
            {
                'name': sample.name,
                'type': 'Sample',
                'barcode': sample.barcode,
                'sequencing_depth': sample.sequencing_depth,
            }
            for sample in req.samples.all()
        ]

        records = sorted(libraries + samples, key=lambda x: x['barcode'][3:])

        html = render_to_string('deepseq_request_pdf.html', {
            'request_name': req.name,
            'date': datetime.now().strftime('%d.%m.%Y'),
            'user': user.get_full_name(),
            'phone': user.phone if user.phone else '',
            'email': user.email,
            'organization': organization,
            'cost_unit': cost_unit,
            'description': req.description,
            'records': records,
        })

        pdf = pdfkit.from_string(html, False, options=settings.PDF_OPTIONS)

        # Generate response
        request_name = normalize('NFKD', req.name).encode('ASCII', 'ignore')
        request_name = request_name.decode('utf-8')
        f_name = request_name + '_Deep_Sequencing_Request.pdf'
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="%s"' % f_name

    except Exception as e:
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


@csrf_exempt
@login_required
def upload_files(request):
    """ Upload request files. """
    file_ids = []
    error = ''

    if request.method == 'POST' and any(request.FILES):
        try:
            for file in request.FILES.getlist('files'):
                f = FileRequest(name=file.name, file=file)
                f.save()
                file_ids.append(f.id)

        except Exception as e:
            error = 'Could not upload the files.'
            logger.exception(e)

    return JsonResponse({
        'success': not error,
        'error': error,
        'fileIds': file_ids
    })


@login_required
def get_files(request):
    """ Get the list of files for the given request id. """
    file_ids = json.loads(request.GET.get('file_ids', '[]'))
    error = ''
    data = []

    try:
        files = [f for f in FileRequest.objects.all() if f.id in file_ids]
        data = [
            {
                'id': file.id,
                'name': file.name,
                'size': file.file.size,
                'path': settings.MEDIA_URL + file.file.name,
            }
            for file in files
        ]

    except Exception as e:
        error = 'Could not get the attached files.'
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error, 'data': data})


@login_required
@staff_member_required
def send_email(request):
    """ Send an email to the user. """
    error = ''

    request_id = request.POST.get('request_id', '')
    subject = request.POST.get('subject', '')
    message = request.POST.get('message', '')
    include_failed_records = json.loads(request.POST.get(
        'include_failed_records', 'false'))
    records = []

    try:
        if subject == '' or message == '':
            raise ValueError('Email subject and/or message is missing.')

        req = Request.objects.get(pk=request_id)
        if include_failed_records:
            records = list(req.libraries.filter(status=-1)) + \
                list(req.samples.filter(status=-1))
            records = sorted(records, key=lambda x: x.barcode[3:])

        send_mail(
            subject=subject,
            message='',
            html_message=render_to_string('email.html', {
                'full_name': req.user.get_full_name(),
                'message': message,
                'records': records,
            }),
            # from_email=settings.SERVER_EMAIL,
            from_email='deepseq@ie-freiburg.mpg.de',
            recipient_list=[req.user.email],
        )

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})
