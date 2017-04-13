from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from .models import NucleicAcidType, Sample, FileSample
from .forms import SampleForm

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
                files = json.loads(records[i].get('files', '[]'))

                if mode == 'add':
                    sample.files.add(*files)
                    data.append({
                        'name': sample.name,
                        'recordType': 'S',
                        'sampleId': sample.pk,
                        'barcode': sample.barcode,
                    })
                else:
                    if files:
                        old_files = [file for file in sample.files.all()]
                        sample.files.clear()
                        sample.save()
                        sample.files.add(*files)
                        new_files = [file for file in sample.files.all()]

                        # Delete files
                        files_to_delete = list(set(old_files) - set(new_files))
                        for file in files_to_delete:
                            file.delete()
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


@csrf_exempt
@login_required
def upload_files(request):
    """ """
    error = ''
    file_ids = []

    if any(request.FILES):
        for file in request.FILES.getlist('files'):
            f = FileSample(name=file.name, file=file)
            f.save()
            file_ids.append(f.pk)

    return JsonResponse({
        'success': not error,
        'error': error,
        'fileIds': file_ids,
    })


@login_required
def get_files(request):
    """ """
    error = ''
    data = []

    file_ids = request.GET.get('file_ids')

    if file_ids:
        file_ids = json.loads(file_ids)

        files = [f for f in FileSample.objects.all() if f.pk in file_ids]
        data = [
            {
                'id': file.id,
                'name': file.name,
                'size': file.file.size,
                'path': settings.MEDIA_URL + file.file.name,
            }
            for file in files
        ]

    return JsonResponse({'success': not error, 'error': error, 'data': data})
