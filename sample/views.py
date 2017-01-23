from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from .models import NucleicAcidType, SampleProtocol, Sample, FileSample
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


def get_sample_protocols(request):
    """ Get the list of all sample protocols. """
    sample_type = request.GET.get('type')
    sample_protocols = SampleProtocol.objects.filter(type=sample_type)

    data = [
        {
            'id': protocol.id,
            'name': protocol.name,
            'type': protocol.type,
            'provider': protocol.provider,
            'catalog': protocol.catalog,
            'explanation': protocol.explanation,
            'inputRequirements': protocol.input_requirements,
            'typicalApplication': protocol.typical_application,
            'comments': protocol.comments,
        }
        for protocol in sample_protocols
    ]

    return JsonResponse(data, safe=False)


@login_required
def save_sample(request):
    """ Add a new sample or update an existing one. """
    error = ''
    form = None
    data = {}

    mode = request.POST.get('mode')
    sample_id = request.POST.get('sample_id')
    files = json.loads(request.POST.get('files')) \
        if request.POST.get('files') else None

    if mode == 'add':
        form = SampleForm(request.POST)
    else:
        try:
            smpl = Sample.objects.get(pk=sample_id)
            form = SampleForm(request.POST, instance=smpl)
        except (ValueError, Sample.DoesNotExist) as e:
            error = str(e)
            logger.exception(e)

    if form:
        if form.is_valid():
            smpl = form.save()

            if mode == 'add':
                if files:
                    smpl.files.add(*files)

                data = {
                    'name': smpl.name,
                    'recordType': 'S',
                    'sampleId': smpl.id,
                    'barcode': smpl.barcode,
                }

            else:
                if files:
                    old_files = [file for file in smpl.files.all()]
                    smpl.files.clear()
                    smpl.save()
                    smpl.files.add(*files)
                    new_files = [file for file in smpl.files.all()]

                    # Delete files
                    files_to_delete = list(set(old_files) - set(new_files))
                    for file in files_to_delete:
                        file.delete()
        else:
            error = str(form.errors)
            logger.debug(form.errors)

    return JsonResponse({
        'success': not error,
        'error': error,
        'data': data
    })


@login_required
def delete_sample(request):
    """ """
    error = ''
    record_id = request.POST.get('record_id')

    try:
        sample = Sample.objects.get(pk=record_id)
        sample.delete()
    except (ValueError, Sample.DoesNotExist) as e:
        error = str(e)
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
        'fileIds': file_ids
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

    return JsonResponse({
        'success': not error,
        'error': error,
        'data': data
    })
