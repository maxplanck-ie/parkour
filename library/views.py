from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required

from .models import Library, FileLibrary
from request.models import Request
from .forms import LibraryForm

import logging
import json

logger = logging.getLogger('db')


@login_required
def get_all(request):
    """ Get the list of all libraries and samples."""
    data = []

    if request.method == 'GET':
        quality_check = request.GET.get('quality_check')

        if request.user.is_staff:
            requests = Request.objects.prefetch_related('libraries', 'samples')
        else:
            requests = Request.objects.filter(
                user_id=request.user.id
            ).prefetch_related('libraries', 'samples')

        for req in requests:
            libraries = req.libraries.all()
            samples = req.samples.all()

            if quality_check:
                libraries = [l for l in libraries if l.status == 1]
                samples = [s for s in samples if s.status == 1]

            libraries_data = [
                {
                    'status': library.status,
                    'requestName': req.name,
                    'requestId': req.pk,
                    'libraryId': library.pk,
                    'name': library.name,
                    'recordType': library.get_record_type(),
                    'date': library.date.strftime('%d.%m.%Y'),
                    'library_protocol': library.library_protocol.pk,
                    'library_protocol_name': library.library_protocol.name,
                    'library_type': library.library_type.pk,
                    'library_type_name': library.library_type.name,
                    'amplification_cycles': library.amplification_cycles,
                    'organism': library.organism.pk,
                    'organism_name': library.organism.name,
                    'index_type': library.index_type.pk,
                    'index_type_name': library.index_type.name,
                    'index_reads': library.index_reads,
                    'index_i7': library.index_i7,
                    'index_i5': library.index_i5,
                    'equalRepresentation':
                        str(library.equal_representation_nucleotides),
                    'concentration': library.concentration,
                    'concentration_method':
                        library.concentration_method.pk,
                    'concentration_method_name':
                        library.concentration_method.name,
                    'mean_fragment_size': library.mean_fragment_size,
                    'qpcr_result': library.qpcr_result,
                    'readLength':
                        library.read_length.name,
                    'readLengthId':
                        library.read_length.id,
                    'sequencing_depth': library.sequencing_depth,
                    'comments': library.comments,
                    'barcode': library.barcode,
                    'files': [file.id for file in library.files.all()],
                    'dilution_factor': library.dilution_factor,
                    'concentration_facility': library.concentration_facility,
                    'concentration_method_facility':
                        library.concentration_method_facility.pk
                        if library.concentration_method_facility is
                        not None else '',
                    'dateFacility': library.date_facility.strftime('%d.%m.%Y')
                        if library.date_facility is not None else '',
                    'amount_facility': library.amount_facility,
                    'size_distribution_facility':
                        library.size_distribution_facility,
                    'sample_volume_facility':
                        library.sample_volume_facility,
                    'comments_facility': library.comments_facility,
                    'qpcr_result_facility': library.qpcr_result_facility,
                }
                for library in libraries
            ]

            samples_data = [
                {
                    'status': sample.status,
                    'requestName': req.name,
                    'requestId': req.pk,
                    'sampleId': sample.pk,
                    'name': sample.name,
                    'recordType': sample.get_record_type(),
                    'date': sample.date.strftime('%d.%m.%Y'),
                    'nucleicAcidType': sample.nucleic_acid_type.name,
                    'nucleicAcidTypeId': sample.nucleic_acid_type_id,
                    'library_protocol': sample.library_protocol.pk,
                    'library_protocol_name': sample.library_protocol.name,
                    'library_type': sample.library_type.pk,
                    'library_type_name': sample.library_type.name,
                    'amplification_cycles': sample.amplification_cycles,
                    'organism': sample.organism.pk,
                    'organism_name': sample.organism.name,
                    'equalRepresentation':
                        str(sample.equal_representation_nucleotides),
                    'concentration': sample.concentration,
                    'concentration_method':
                        sample.concentration_method.pk,
                    'concentration_method_name':
                        sample.concentration_method.name,
                    'readLength':
                        sample.read_length.name,
                    'readLengthId':
                        sample.read_length.id,
                    'sequencing_depth': sample.sequencing_depth,
                    'rna_quality': sample.rna_quality
                        if sample.rna_quality else '',
                    'comments': sample.comments,
                    'barcode': sample.barcode,
                    'files': [file.id for file in sample.files.all()],
                    'dilution_factor': sample.dilution_factor,
                    'concentration_facility': sample.concentration_facility,
                    'concentration_method_facility':
                        sample.concentration_method_facility.pk
                        if sample.concentration_method_facility is
                        not None else '',
                    'dateFacility': sample.date_facility.strftime('%d.%m.%Y')
                        if sample.date_facility is not None else '',
                    'amount_facility': sample.amount_facility,
                    'size_distribution_facility':
                        sample.size_distribution_facility,
                    'sample_volume_facility':
                        sample.sample_volume_facility,
                    'comments_facility': sample.comments_facility,
                    'rna_quality_facility': sample.rna_quality_facility,
                }
                for sample in samples
            ]

            data += libraries_data + samples_data

        data = sorted(
            data,
            key=lambda x: (x['date'], x['recordType'], x['name']),
            reverse=True,
        )

    return JsonResponse(data, safe=False)


@login_required
def save_library(request):
    """ Add new library or update an existing one. """
    error = []
    data = []

    try:
        if request.method != 'POST':
            raise ValueError('Wrong HTTP method.')

        mode = request.POST.get('mode')
        records = json.loads(request.POST.get('records', '[]'))

        if not records:
            raise ValueError('No records.')

        if mode == 'add':
            forms = [LibraryForm(record) for record in records]
        elif mode == 'edit':
            record = records[0]
            library_id = record.get('library_id', '')
            library = Library.objects.get(pk=library_id)
            forms = [LibraryForm(record, instance=library)]
        else:
            raise ValueError('Wrong or missing mode.')

        for i, form in enumerate(forms):
            if form.is_valid():
                library = form.save()
                files = json.loads(records[i].get('files', '[]'))

                if mode == 'add':
                    library.files.add(*files)
                    data.append({
                        'name': library.name,
                        'recordType': 'L',
                        'libraryId': library.pk,
                        'barcode': library.barcode
                    })
                else:
                    if files:
                        old_files = [file for file in library.files.all()]
                        library.files.clear()
                        library.save()
                        library.files.add(*files)
                        new_files = [file for file in library.files.all()]

                        # Delete files
                        files_to_delete = list(set(old_files) - set(new_files))
                        for file in files_to_delete:
                            file.delete()
            else:
                name = form.data['name']
                if name and 'name' in form.errors.keys():
                    error_msg = form.errors['name'][0]
                else:
                    error_msg = 'Could not save the library.'
                error.append({'name': name, 'value': error_msg})
                logger.debug(form.errors)

    except Exception as e:
        error = 'Could not save the library(-ies).'
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error, 'data': data})


@login_required
def delete_library(request):
    """ Delete library with a given id. """
    error = ''

    try:
        if request.method != 'POST':
            raise ValueError('Wrong HTTP method.')
        record_id = request.POST.get('record_id', '')
        library = Library.objects.get(pk=record_id)
        library.delete()
    except (ValueError, Library.DoesNotExist) as e:
        error = 'Could not delete the library.'
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@login_required
def upload_files(request):
    """ """
    file_ids = []
    error = ''

    if request.method == 'POST' and any(request.FILES):
        try:
            for file in request.FILES.getlist('files'):
                f = FileLibrary(name=file.name, file=file)
                f.save()
                file_ids.append(f.id)

        except Exception as e:
            error = 'Could not upload the file(s).'
            logger.exception(e)

    return JsonResponse({
        'success': not error,
        'error': error,
        'fileIds': file_ids
    })


@login_required
def get_files(request):
    """ """
    file_ids = json.loads(request.GET.get('file_ids'))
    error = ''
    data = []

    try:
        files = [f for f in FileLibrary.objects.all() if f.id in file_ids]
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
        error = 'Could not get attached files.'
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error, 'data': data})
