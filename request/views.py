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
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from .models import Request, FileRequest
from .serializers import RequestSerializer, RequestFileSerializer
from .forms import RequestForm
from library.models import Library
from sample.models import Sample

User = get_user_model()
logger = logging.getLogger('db')


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


class RequestViewSet(viewsets.ViewSet):

    def list(self, request):
        queryset = Request.objects.all().order_by('-create_time')
        if self.request.user.is_staff:
            # Show only those Requests, whose libraries and samples
            # haven't reached status 6 yet
            queryset = [x for x in queryset if x.statuses.count(6) == 0]
        else:
            queryset = queryset.filter(user=self.request.user)
        serializer = RequestSerializer(queryset, many=True, context={
            'request': request,
        })
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        data = {}
        try:
            queryset = Request.objects.get(pk=pk)
        except (ValueError, Request.DoesNotExist):
            pass
        else:
            serializer = RequestSerializer(queryset, context={
                'request': request,
            })
            data = serializer.data
        return Response(data)

    # def destroy(self, request, pk=None):
    #     try:
    #         queryset = Request.objects.get(pk=pk)
    #     except (ValueError, Request.DoesNotExist):
    #         pass
    #     else:
    #         import pdb; pdb.set_trace()
    #         pass

    @detail_route(methods=['get'])
    def get_records(self, request, pk=None):
        """ Get the list of record's submitted libraries and samples. """
        data = []
        try:
            queryset = Request.objects.get(pk=pk)
        except (ValueError, Request.DoesNotExist):
            pass
        else:
            data = [{
                'name': obj.name,
                'record_type': obj.get_record_type(),
                'library_id': obj.pk if isinstance(obj, Library) else 0,
                'sample_id': obj.pk if isinstance(obj, Sample) else 0,
                'barcode': obj.barcode,
                'is_coverted': True
                if isinstance(obj, Sample) and obj.is_converted else False,
            } for obj in queryset.records]
            data = sorted(data, key=lambda x: x['barcode'][3:])
        return Response(data)

    @detail_route(methods=['get'])
    def get_files(self, request, pk=None):
        """ Get the list of attached files. """
        data = []
        try:
            queryset = Request.objects.get(pk=pk).files.order_by('name')
        except (ValueError, Request.DoesNotExist):
            pass
        else:
            serializer = RequestFileSerializer(queryset, many=True)
            data = serializer.data
        return Response(data)
