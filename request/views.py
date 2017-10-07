import json
import logging
from datetime import datetime
from unicodedata import normalize
import itertools

import pdfkit

from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from django.core.mail import send_mail
# from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import detail_route, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAdminUser

from common.views import (CsrfExemptSessionAuthentication,
                          StandardResultsSetPagination)
from .models import Request, FileRequest
from .serializers import RequestSerializer, RequestFileSerializer

User = get_user_model()
logger = logging.getLogger('db')


def handle_request_id_exceptions(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)

        except ValueError:
            return Response({
                'success': False,
                'message': 'Id is not provided.',
            }, 400)

        except Request.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Request does not exist.',
            }, 404)

    return wrapper


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


class RequestViewSet(viewsets.GenericViewSet):
    serializer_class = RequestSerializer
    pagination_class = StandardResultsSetPagination
    authentication_classes = [CsrfExemptSessionAuthentication]

    def get_queryset(self):
        queryset = Request.objects.prefetch_related(
            'user', 'libraries', 'samples', 'files').order_by('-create_time')

        # If a search query is given
        search_query = self.request.query_params.get('query', None)
        if search_query:
            # TODO: implements this
            # fields = [f for f in Request._meta.fields
            #           if isinstance(f, CharField) or isinstance(f, TextField)]
            # queries = [Q(**{f.name: search_query}) for f in fields]
            # qs = Q()
            # for query in queries:
            #     qs = qs | query
            # queryset = queryset.filter(qs)
            pass

        if self.request.user.is_staff:
            # Show only those Requests, whose libraries and samples
            # haven't reached status 6 yet
            # TODO: find a way to hide requests
            # queryset = [x for x in queryset if x.statuses.count(6) == 0]
            pass
        else:
            queryset = queryset.filter(user=self.request.user)
        return queryset

    def list(self, request):
        """ Get the list of requests. """
        queryset = self.get_queryset()
        # page = self.paginate_queryset(queryset)

        try:
            page = self.paginate_queryset(queryset)
        except NotFound:
            page = None

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        """ Create a request. """

        if request.is_ajax():
            post_data = request.data.get('data', [])
        else:
            post_data = json.loads(request.data.get('data', '[]'))
        post_data.update({'user': request.user.pk})

        serializer = self.serializer_class(data=post_data)

        if serializer.is_valid():
            serializer.save()
            return Response({'success': True}, 201)

        else:
            return Response({
                'success': False,
                'message': 'Invalid payload.',
                'errors': serializer.errors,
            }, 400)

    @handle_request_id_exceptions
    def retrieve(self, request, pk=None):
        """ Get request with a given id. """
        queryset = Request.objects.get(pk=pk)
        serializer = self.get_serializer(queryset)
        return Response(serializer.data)

    @detail_route(methods=['post'])
    @handle_request_id_exceptions
    def edit(self, request, pk=None):
        """ Update request with a given id. """
        queryset = Request.objects.get(pk=pk)

        if request.is_ajax():
            post_data = request.data.get('data', {})
            if isinstance(post_data, str):
                post_data = json.loads(post_data)
                # try:
                #     post_data = json.loads(post_data):
                # except Exception:
                #     pass
        else:
            post_data = json.loads(request.data.get('data', '{}'))

        post_data.update({'user': request.user.pk})

        serializer = self.get_serializer(data=post_data, instance=queryset)

        if serializer.is_valid():
            serializer.save()
            return Response({'success': True})

        else:
            return Response({
                'success': False,
                'message': 'Invalid payload.',
                'errors': serializer.errors,
            }, 400)

    @handle_request_id_exceptions
    def destroy(self, request, pk=None):
        """ Delete a request. """
        queryset = Request.objects.get(pk=pk)
        queryset.delete()
        return Response({'success': True})

    @detail_route(methods=['get'])
    @handle_request_id_exceptions
    def get_records(self, request, pk=None):
        """ Get the list of record's submitted libraries and samples. """
        queryset = Request.objects.get(pk=pk)
        data = [{
            'pk': obj.pk,
            'record_type': obj.__class__.__name__,
            'name': obj.name,
            'barcode': obj.barcode,
            'is_converted': True
            if hasattr(obj, 'is_converted') and obj.is_converted else False,
        } for obj in queryset.records]

        data = sorted(data, key=lambda x: x['barcode'][3:])
        return Response(data)

    @detail_route(methods=['get'])
    @handle_request_id_exceptions
    def get_files(self, request, pk=None):
        """ Get the list of attached files. """
        queryset = Request.objects.get(pk=pk).files.order_by('name')
        serializer = RequestFileSerializer(queryset, many=True)
        return Response(serializer.data)

    @detail_route(methods=['get'])
    @handle_request_id_exceptions
    def download_deep_sequencing_request(self, request, pk=None):
        """ Generate a deep sequencing request form in PDF. """
        req = Request.objects.get(pk=pk)
        user = req.user
        cost_unit = ', '.join(sorted(
            user.cost_unit.values_list('name', flat=True)
        ))

        objects = list(itertools.chain(req.samples.all(), req.libraries.all()))
        records = [{
            'name': obj.name,
            'type': obj.__class__.__name__,
            'barcode': obj.barcode,
            'sequencing_depth': obj.sequencing_depth,
        } for obj in objects]
        records = sorted(records, key=lambda x: x['barcode'][3:])

        html = render_to_string('deepseq_request_pdf.html', {
            'request_name': req.name,
            'date': datetime.now().strftime('%d.%m.%Y'),
            'user': user.get_full_name(),
            'phone': user.phone if user.phone else '',
            'email': user.email,
            'organization':
            user.organization.name if user.organization else '',
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

        return response

    @detail_route(methods=['post'])
    @handle_request_id_exceptions
    def upload_deep_sequencing_request(self, request, pk=None):
        """
        Upload a deep sequencing request with the PI's signature and
        change request's libraries' and samples' statuses to 1.
        """
        req = Request.objects.get(pk=pk)

        if not any(request.FILES):
            return JsonResponse({
                'success': False,
                'message': 'File is missing.'
            }, status=400)

        req.deep_seq_request = request.FILES.get('file')
        req.save()

        file_name = req.deep_seq_request.name.split('/')[-1]
        file_path = settings.MEDIA_URL + req.deep_seq_request.name

        req.libraries.all().update(status=1)
        req.samples.all().update(status=1)

        return JsonResponse({
             'success': True,
             'name': file_name,
             'path': file_path
        })

    @detail_route(methods=['post'])
    @handle_request_id_exceptions
    @permission_classes((IsAdminUser))
    def send_email(self, request, pk=None):
        """ Send an email to the user. """
        error = ''

        req = Request.objects.get(pk=pk)
        subject = request.data.get('subject', '')
        message = request.data.get('message', '')
        include_failed_records = json.loads(request.POST.get(
            'include_failed_records', 'false'))
        records = []

        # TODO: check if it's possible to send emails at all

        try:
            if subject == '' or message == '':
                raise ValueError('Email subject and/or message is missing.')

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
