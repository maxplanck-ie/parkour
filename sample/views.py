from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets

from .models import NucleicAcidType, Sample
from .forms import SampleForm
from .serializers import NucleicAcidTypeSerializer, SampleSerializer
from library_sample_shared.views import LibrarySampleBaseViewSet

import logging
import json

logger = logging.getLogger('db')


def get_nucleic_acid_types(request):
    """ Get the list of all nucleic acid types. """
    data = [
        {
            'id': nat.id,
            'name': nat.name,
            'type': nat.type,
        }
        for nat in NucleicAcidType.objects.all()
    ]
    data = sorted(data, key=lambda x: (x['type'], x['name']))
    return JsonResponse(data, safe=False)


@login_required
def save_sample(request):
    """ Add new sample or update an existing one. """
    error = []
    data = []

    try:
        if request.method != 'POST':
            raise ValueError('Wrong HTTP method.')

        mode = request.POST.get('mode', '')
        records = json.loads(request.POST.get('records', '[]'))

        if not records:
            raise ValueError('No records.')

        if mode == 'add':
            forms = [SampleForm(record) for record in records]
        elif mode == 'edit':
            record = records[0]
            sample_id = record.get('sample_id', '')
            sample = Sample.objects.get(pk=sample_id)
            forms = [SampleForm(record, instance=sample)]
        else:
            raise ValueError('Wrong or missing mode.')

        for i, form in enumerate(forms):
            if form.is_valid():
                sample = form.save()
                if mode == 'add':
                    data.append({
                        'name': sample.name,
                        'recordType': 'S',
                        'sample_id': sample.pk,
                        'barcode': sample.barcode,
                    })
            else:
                name = form.data['name']
                if name and 'name' in form.errors.keys():
                    error_msg = form.errors['name'][0]
                else:
                    error_msg = 'Could not save the sample.'
                error.append({'name': name, 'value': error_msg})
                logger.debug(form.errors)

    except Exception as e:
        error = 'Could not save the sample(s).'
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error, 'data': data})


@login_required
def delete_sample(request):
    """ Delete sample with a given id. """
    error = ''

    try:
        if request.method != 'POST':
            raise ValueError('Wrong HTTP method.')
        record_id = request.POST.get('record_id', '')
        sample = Sample.objects.get(pk=record_id)
        sample.delete()
    except (ValueError, Sample.DoesNotExist) as e:
        error = 'Could not delete the sample.'
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


class NucleicAcidTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """ Get the list of nucleic acid types. """
    serializer_class = NucleicAcidTypeSerializer

    def get_queryset(self):
        return NucleicAcidType.objects.order_by('type', 'name')


class SampleViewSet(LibrarySampleBaseViewSet):
    serializer_class = SampleSerializer
