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
                    'requestId': req.id,
                    'libraryId': library.id,
                    'name': library.name,
                    'recordType': library.get_record_type(),
                    'date': library.date.strftime('%d.%m.%Y'),
                    'libraryProtocol': library.library_protocol.name,
                    'libraryProtocolId': library.library_protocol.id,
                    'libraryType': library.library_type.name,
                    'libraryTypeId': library.library_type.id,
                    'amplification_cycles': library.amplification_cycles,
                    'organism': library.organism.name,
                    'organismId': library.organism.id,
                    'indexType': library.index_type.name,
                    'indexTypeId': library.index_type.id,
                    'index_reads': library.index_reads,
                    'index_i7': library.index_i7,
                    'index_i5': library.index_i5,
                    'equalRepresentation':
                        str(library.equal_representation_nucleotides),
                    'concentration': library.concentration,
                    'concentrationMethod':
                        library.concentration_method.name,
                    'concentrationMethodId':
                        library.concentration_method.id,
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
                    'dilutionFactor': library.dilution_factor,
                    'concentrationFacility': library.concentration_facility,
                    'concentrationMethodFacility':
                        library.concentration_method_facility.name
                        if library.concentration_method_facility is
                        not None else '',
                    'concentrationMethodFacilityId':
                        library.concentration_method_facility.id
                        if library.concentration_method_facility is
                        not None else '',
                    'dateFacility': library.date_facility.strftime('%d.%m.%Y')
                        if library.date_facility is not None else '',
                    'amountFacility': library.amount_facility,
                    'sizeDistributionFacility':
                        library.size_distribution_facility,
                    'commentsFacility': library.comments_facility,
                    'qPCRResultFacility': library.qpcr_result_facility,
                }
                for library in libraries
            ]

            samples_data = [
                {
                    'status': sample.status,
                    'requestName': req.name,
                    'requestId': req.id,
                    'sampleId': sample.id,
                    'name': sample.name,
                    'recordType': sample.get_record_type(),
                    'date': sample.date.strftime('%d.%m.%Y'),
                    'nucleicAcidType': sample.nucleic_acid_type.name,
                    'nucleicAcidTypeId': sample.nucleic_acid_type_id,
                    'libraryProtocol': sample.library_protocol.name,
                    'libraryProtocolId': sample.library_protocol_id,
                    'libraryType': sample.library_type.name,
                    'libraryTypeId': sample.library_type.id,
                    'amplification_cycles': sample.amplification_cycles,
                    'organism': sample.organism.name,
                    'organismId': sample.organism.id,
                    'equalRepresentation':
                        str(sample.equal_representation_nucleotides),
                    'concentration': sample.concentration,
                    'concentrationMethod':
                        sample.concentration_method.name,
                    'concentrationMethodId':
                        sample.concentration_method.id,
                    'readLength':
                        sample.read_length.name,
                    'readLengthId':
                        sample.read_length.id,
                    'sequencing_depth': sample.sequencing_depth,
                    'rnaQuality': sample.rna_quality
                        if sample.rna_quality else '',
                    'rnaQualityName': sample.get_rna_quality_display()
                        if sample.rna_quality else '',
                    'comments': sample.comments,
                    'barcode': sample.barcode,
                    'files': [file.id for file in sample.files.all()],
                    'dilutionFactor': sample.dilution_factor,
                    'concentrationFacility': sample.concentration_facility,
                    'concentrationMethodFacility':
                        sample.concentration_method_facility.name
                        if sample.concentration_method_facility is
                        not None else '',
                    'concentrationMethodFacilityId':
                        sample.concentration_method_facility.id
                        if sample.concentration_method_facility is
                        not None else '',
                    'dateFacility': sample.date_facility.strftime('%d.%m.%Y')
                        if sample.date_facility is not None else '',
                    'amountFacility': sample.amount_facility,
                    'sizeDistributionFacility':
                        sample.size_distribution_facility,
                    'commentsFacility': sample.comments_facility,
                    'rnaQualityFacility': sample.rna_quality_facility,
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
    """ Add a new library or update an existing one. """
    error = ''
    data = []

    try:
        if request.method != 'POST':
            raise ValueError('Wrong HTTP method.')

        mode = request.POST.get('mode')
        library_id = request.POST.get('library_id', '')
        files = json.loads(request.POST.get('files', '[]'))

        if mode == 'add':
            form = LibraryForm(request.POST)
        elif mode == 'edit':
            lib = Library.objects.get(id=library_id)
            form = LibraryForm(request.POST, instance=lib)
        else:
            raise ValueError('Wrong or missing mode.')

        if form.is_valid():
            lib = form.save()

            if mode == 'add':
                lib.files.add(*files)
                data = {
                    'name': lib.name,
                    'recordType': 'L',
                    'libraryId': lib.id,
                    'barcode': lib.barcode,
                }
            else:
                if files:
                    old_files = [file for file in lib.files.all()]
                    lib.files.clear()
                    lib.save()
                    lib.files.add(*files)
                    new_files = [file for file in lib.files.all()]

                    # Delete files
                    files_to_delete = list(set(old_files) - set(new_files))
                    for file in files_to_delete:
                        file.delete()
        else:
            error = str(form.errors)
            logger.debug(form.errors)

    except Exception as e:
        error = 'Could not save the library.'
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
