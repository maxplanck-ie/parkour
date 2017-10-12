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


class RequestViewSet(viewsets.ModelViewSet):
    serializer_class = RequestSerializer
    pagination_class = StandardResultsSetPagination
    authentication_classes = [CsrfExemptSessionAuthentication]

    def get_queryset(self):
        queryset = Request.objects.prefetch_related(
            'user', 'libraries', 'samples', 'files'
        ).order_by('-create_time')

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
        post_data = self._get_post_data(request)
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

    @detail_route(methods=['post'])
    def edit(self, request, pk=None):
        """ Update request with a given id. """
        instance = self.get_object()
        post_data = self._get_post_data(request)
        post_data.update({'user': request.user.pk})

        serializer = self.get_serializer(data=post_data, instance=instance)

        if serializer.is_valid():
            serializer.save()
            return Response({'success': True})

        else:
            return Response({
                'success': False,
                'message': 'Invalid payload.',
                'errors': serializer.errors,
            }, 400)

    @detail_route(methods=['post'])
    def samples_submitted(self, request, pk=None):
        instance = self.get_object()
        post_data = self._get_post_data(request)
        instance.samples_submitted = post_data['result']
        instance.save(update_fields=['samples_submitted'])
        return Response({'success': True})

    @detail_route(methods=['get'])
    def get_records(self, request, pk=None):
        """ Get the list of record's submitted libraries and samples. """
        instance = self.get_object()
        data = [{
            'pk': obj.pk,
            'record_type': obj.__class__.__name__,
            'name': obj.name,
            'barcode': obj.barcode,
            'is_converted': True
            if hasattr(obj, 'is_converted') and obj.is_converted else False,
        } for obj in instance.records]

        data = sorted(data, key=lambda x: x['barcode'][3:])
        return Response(data)

    @detail_route(methods=['get'])
    def get_files(self, request, pk=None):
        """ Get the list of attached files for a request with a given id. """
        instance = self.get_object()
        files = instance.files.all().order_by('name')
        serializer = RequestFileSerializer(files, many=True)
        return Response(serializer.data)

    @detail_route(methods=['get'])
    def download_deep_sequencing_request(self, request, pk=None):
        """ Generate a deep sequencing request form in PDF. """
        instance = self.get_object()
        user = instance.user
        cost_unit = ', '.join(sorted(
            user.cost_unit.values_list('name', flat=True)
        ))

        objects = list(itertools.chain(
            instance.samples.all(), instance.libraries.all()
        ))
        records = [{
            'name': obj.name,
            'type': obj.__class__.__name__,
            'barcode': obj.barcode,
            'sequencing_depth': obj.sequencing_depth,
        } for obj in objects]
        records = sorted(records, key=lambda x: x['barcode'][3:])

        html = render_to_string('deepseq_request_pdf.html', {
            'request_name': instance.name,
            'date': datetime.now().strftime('%d.%m.%Y'),
            'user': user.get_full_name(),
            'phone': user.phone if user.phone else '',
            'email': user.email,
            'organization':
            user.organization.name if user.organization else '',
            'cost_unit': cost_unit,
            'description': instance.description,
            'records': records,
        })

        pdf = pdfkit.from_string(html, False, options=settings.PDF_OPTIONS)

        # Generate response
        request_name = normalize(
            'NFKD', instance.name
        ).encode('ASCII', 'ignore').decode('utf-8')
        f_name = request_name + '_Deep_Sequencing_Request.pdf'
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="%s"' % f_name

        return response

    @detail_route(methods=['post'])
    def upload_deep_sequencing_request(self, request, pk=None):
        """
        Upload a deep sequencing request with the PI's signature and
        change request's libraries' and samples' statuses to 1.
        """
        instance = self.get_object()

        if not any(request.FILES):
            return JsonResponse({
                'success': False,
                'message': 'File is missing.'
            }, status=400)

        instance.deep_seq_request = request.FILES.get('file')
        instance.save()

        file_name = instance.deep_seq_request.name.split('/')[-1]
        file_path = settings.MEDIA_URL + instance.deep_seq_request.name

        instance.libraries.all().update(status=1)
        instance.samples.all().update(status=1)

        return JsonResponse({
             'success': True,
             'name': file_name,
             'path': file_path
        })

    @detail_route(methods=['post'])
    @permission_classes((IsAdminUser))
    def send_email(self, request, pk=None):
        """ Send an email to the user. """
        error = ''

        instance = self.get_object()
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
                records = list(instance.libraries.filter(status=-1)) + \
                    list(instance.samples.filter(status=-1))
                records = sorted(records, key=lambda x: x.barcode[3:])

            send_mail(
                subject=subject,
                message='',
                html_message=render_to_string('email.html', {
                    'full_name': instance.user.get_full_name(),
                    'message': message,
                    'records': records,
                }),
                # from_email=settings.SERVER_EMAIL,
                from_email='deepseq@ie-freiburg.mpg.de',
                recipient_list=[instance.user.email],
            )

        except Exception as e:
            error = str(e)
            logger.exception(e)

        return JsonResponse({'success': not error, 'error': error})

    def _get_post_data(self, request):
        post_data = {}
        if request.is_ajax():
            post_data = request.data.get('data', {})
            if isinstance(post_data, str):
                post_data = json.loads(post_data)
        else:
            post_data = json.loads(request.data.get('data', '{}'))
        return post_data
