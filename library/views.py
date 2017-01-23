from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required

from .models import LibraryProtocol, LibraryType, Library, FileLibrary
from request.models import Request
from .forms import LibraryForm

import logging
import json

logger = logging.getLogger('db')


@login_required
def get_all(request):
    """
    Get the list of all libraries and samples.
    """
    quality_check = request.GET.get('quality_check')
    data = []

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
                'recordType': 'L',
                'date': library.date.strftime('%d.%m.%Y'),
                'libraryProtocol': library.library_protocol.name,
                'libraryProtocolId': library.library_protocol.id,
                'libraryType': library.library_type.name,
                'libraryTypeId': library.library_type.id,
                'enrichmentCycles': library.enrichment_cycles,
                'organism': library.organism.name,
                'organismId': library.organism.id,
                'indexType': library.index_type.name,
                'indexTypeId': library.index_type.id,
                'indexReads': library.index_reads,
                'indexI7': library.index_i7,
                'indexI5': library.index_i5,
                'equalRepresentation':
                    str(library.equal_representation_nucleotides),
                'DNADissolvedIn': library.dna_dissolved_in,
                'concentration': library.concentration,
                'concentrationMethod':
                    library.concentration_method.name,
                'concentrationMethodId':
                    library.concentration_method.id,
                'sampleVolume': library.sample_volume,
                'meanFragmentSize': library.mean_fragment_size,
                'qPCRResult': library.qpcr_result,
                'readLength':
                    library.read_length.name,
                'readLengthId':
                    library.read_length.id,
                'sequencingDepth': library.sequencing_depth,
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
                'sampleVolumeFacility': library.sample_volume_facility,
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
                'recordType': 'S',
                'date': sample.date.strftime('%d.%m.%Y'),
                'nucleicAcidType': sample.nucleic_acid_type.name,
                'nucleicAcidTypeId': sample.nucleic_acid_type_id,
                'libraryProtocol': sample.sample_protocol.name,
                'libraryProtocolId': sample.sample_protocol_id,
                'amplifiedCycles': sample.amplified_cycles,
                'organism': sample.organism.name,
                'organismId': sample.organism.id,
                'equalRepresentation':
                    str(sample.equal_representation_nucleotides),
                'DNADissolvedIn': sample.dna_dissolved_in,
                'concentration': sample.concentration,
                'concentrationMethod':
                    sample.concentration_method.name,
                'concentrationMethodId':
                    sample.concentration_method.id,
                'sampleVolume': sample.sample_volume,
                'readLength':
                    sample.read_length.name,
                'readLengthId':
                    sample.read_length.id,
                'sequencingDepth': sample.sequencing_depth,
                'DNaseTreatment': str(sample.dnase_treatment),
                'rnaQuality': sample.rna_quality
                    if sample.rna_quality else '',
                'rnaSpikeIn': str(sample.rna_spike_in),
                'samplePreparationProtocol':
                    sample.sample_preparation_protocol,
                'requestedSampleTreatment':
                    sample.requested_sample_treatment,
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
                'sampleVolumeFacility': sample.sample_volume_facility,
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


def get_library_protocols(request):
    """ Get the list of all library protocols. """
    data = [
        {
            'id': protocol.id,
            'name': protocol.name,
            'provider': protocol.provider,
        }
        for protocol in LibraryProtocol.objects.all()
    ]
    return JsonResponse(data, safe=False)


def get_library_type(request):
    """ Get the list of all library types for a given library protocol. """
    data = []
    library_protocol_id = request.GET.get('library_protocol_id', '')

    try:
        protocol = LibraryProtocol.objects.get(pk=library_protocol_id)
        library_types = LibraryType.objects.filter(
            library_protocol__in=[protocol]
        )

        data = [
            {
                'id': library_type.id,
                'name': library_type.name,
            }
            for library_type in library_types
        ]

    except (ValueError, LibraryProtocol.DoesNotExist) as e:
        logger.exception(e)

    return JsonResponse(data, safe=False)


@login_required
def save_library(request):
    """ Add a new library or update an existing one. """
    error = ''
    data = []

    if request.method == 'POST':
        mode = request.POST.get('mode')
        library_id = request.POST.get('library_id', '')
        files = json.loads(request.POST.get('files', '[]'))

        if mode == 'add':
            form = LibraryForm(request.POST)
        elif mode == 'edit':
            try:
                lib = Library.objects.get(id=library_id)
                form = LibraryForm(request.POST, instance=lib)
            except (ValueError, Library.DoesNotExist) as e:
                form = None
                error = str(e)
                logger.exception(e)
        else:
            form = None

        if form:
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

                elif mode == 'edit':
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
                logger.debug(form.errors.as_data())
        else:
            error = error if error else 'Wrong or missing mode.'
    else:
        error = 'Wrong HTTP method.'

    return JsonResponse({'success': not error, 'error': error, 'data': data})


@login_required
def delete_library(request):
    """ Delete a library with a given id. """
    error = ''

    if request.method == 'POST':
        record_id = request.POST.get('record_id', '')
        try:
            record = Library.objects.get(pk=record_id)
            record.delete()
        except (ValueError, Library.DoesNotExist) as e:
            error = str(e)
            logger.exception(e)
    else:
        error = 'Wrong HTTP method.'

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
            error = str(e)
            logger.exception(error)

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
        error = str(e)
        logger.exception(error)

    return JsonResponse({'success': not error, 'error': error, 'data': data})
