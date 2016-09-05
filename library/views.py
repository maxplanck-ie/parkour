from django.http import HttpResponse
from django.conf import settings
from django.views.generic import View
from django.core.urlresolvers import resolve
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from request.models import Request
from library.models import LibraryProtocol, LibraryType, Organism, IndexType, \
    IndexI7, IndexI5, ConcentrationMethod, SequencingRunCondition, Library, \
    LibraryForm, NucleicAcidType, SampleProtocol, RNAQuality, Sample, \
    SampleForm, FileSample, FileLibrary
from common.utils import get_simple_field_dict

import json
import logging
# from datetime import datetime

logger = logging.getLogger('db')


class LibraryField(View):
    """ Base class for Library field views """
    def get(self, request):
        error = str()
        data = []

        try:
            # Call one of the class methods
            data = getattr(self, resolve(request.path).url_name)()

            try:
                if data and 'name' in data[0].keys():
                    # Move 'Other' option to the end of list
                    index = next(
                        index
                        for (index, d) in enumerate(data)
                        if d['name'] == 'Other'
                    )
                    data += [data.pop(index)]
            except StopIteration:
                pass

        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(
            json.dumps({
                'success': not error,
                'error': error,
                'data': data,
            }),
            content_type='application/json',
        )

    @staticmethod
    def get_library_protocols():
        """ Get the list of all library protocols """
        library_protocols = LibraryProtocol.objects.all()
        data = [
            {
                'id': protocol.id,
                'name': protocol.name,
                'provider': protocol.provider,
            }
            for protocol in library_protocols
        ]
        return data

    def get_library_type(self):
        """ Get library type for a given library protocol id """
        library_protocol_id = self.request.GET.get('library_protocol_id')
        library_protocol = LibraryProtocol.objects.get(id=library_protocol_id)
        library_types = LibraryType.objects.filter(
            library_protocol__in=[library_protocol]
        )
        return get_simple_field_dict(library_types)

    @staticmethod
    def get_organisms():
        """ Get the list of all organisms """
        organisms = Organism.objects.all()
        return get_simple_field_dict(organisms)

    @staticmethod
    def get_index_types():
        """ Get the list of all index types """
        index_types = IndexType.objects.all()
        return get_simple_field_dict(index_types)

    def get_index_i7(self):
        """ Get the list of all indices i7 for a given index type """
        index_type = self.request.GET.get('index_type_id')
        indices = IndexI7.objects.filter(index_type=index_type)
        data = [
            {
                'id': index.id,
                'name': '%s - %s' % (index.index_id, index.index),
                'index': index.index,
            }
            for index in indices
        ]
        data = sorted(data, key=lambda x: x['id'])
        return data

    def get_index_i5(self):
        """ Get the list of all indices i5 for a given index type """
        index_type = self.request.GET.get('index_type_id')
        indices = IndexI5.objects.filter(index_type=index_type)
        data = [
            {
                'id': index.id,
                'name': '%s - %s' % (index.index_id, index.index),
                'index': index.index,
            }
            for index in indices
        ]
        data = sorted(data, key=lambda x: x['id'])
        return data

    @staticmethod
    def get_concentration_methods():
        """ Get the list of all concentration methods """
        methods = ConcentrationMethod.objects.all()
        return get_simple_field_dict(methods)

    @staticmethod
    def get_sequencing_run_conditions():
        """  Get the list of all sequencing run conditions """
        conditions = SequencingRunCondition.objects.all()
        return get_simple_field_dict(conditions)


class LibraryView(View):
    def get(self, request):
        error = str()
        data = []

        try:
            data = getattr(self, resolve(request.path).url_name)()
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(
            json.dumps({
                'success': not error,
                'error': error,
                'data': data,
            }),
            content_type='application/json',
        )

    def post(self, request):
        """ Save Library """
        error = str()
        data = None

        try:
            data = getattr(self, resolve(request.path).url_name)()
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        result = {
            'success': not error,
            'error': error,
        }
        if data:
            result.update({'data': data})

        return HttpResponse(
            json.dumps(result),
            content_type='application/json',
        )

    @staticmethod
    def get_libraries():
        """ Get the list of all libraries and samples """
        data = []

        requests = Request.objects.select_related()
        for request in requests:
            libraries_data = [
                {
                    'requestName': request.name,
                    'requestId': request.id,
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
                        library.concentration_determined_by.name,
                    'concentrationMethodId':
                        library.concentration_determined_by.id,
                    'sampleVolume': library.sample_volume,
                    'meanFragmentSize': library.mean_fragment_size,
                    'qPCRResult': library.qpcr_result,
                    'sequencingRunCondition':
                        library.sequencing_run_condition.name,
                    'sequencingRunConditionId':
                        library.sequencing_run_condition.id,
                    'sequencingDepth': library.sequencing_depth,
                    'comments': library.comments,
                    'files': [file.id for file in library.files.all()],
                    'dilutionFactor': library.dilution_factor,
                    'concentrationFacility': library.concentration_facility,
                    'concentrationMethodFacility':
                        library.concentration_determined_by_facility.name
                        if library.concentration_determined_by_facility is
                        not None else '',
                    'concentrationMethodFacilityId':
                        library.concentration_determined_by_facility.id
                        if library.concentration_determined_by_facility is
                        not None else '',
                    'dateFacility': library.date_facility.strftime('%d.%m.%Y')
                        if library.date_facility is not None else '',
                    'sampleVolumeFacility': library.sample_volume_facility,
                    'amountFacility': library.amount_facility,
                    'sizeDistributionFacility':
                        library.size_distribution_facility,
                    'commentsFacility': library.comments_facility,
                    'qcResult': library.qc_result,
                    'qPCRResultFacility': library.qpcr_result_facility,
                }
                for library in request.libraries.all()
            ]

            samples_data = [
                {
                    'requestName': request.name,
                    'requestId': request.id,
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
                        sample.concentration_determined_by.name,
                    'concentrationMethodId':
                        sample.concentration_determined_by.id,
                    'sampleVolume': sample.sample_volume,
                    'sequencingRunCondition':
                        sample.sequencing_run_condition.name,
                    'sequencingRunConditionId':
                        sample.sequencing_run_condition.id,
                    'sequencingDepth': sample.sequencing_depth,
                    'DNaseTreatment': str(sample.dnase_treatment),
                    'rnaQuality': sample.rna_quality.name
                        if sample.rna_quality else '',
                    'rnaQualityId': sample.rna_quality_id
                        if sample.rna_quality else '',
                    'rnaSpikeIn': str(sample.rna_spike_in),
                    'samplePreparationProtocol':
                        sample.sample_preparation_protocol,
                    'requestedSampleTreatment':
                        sample.requested_sample_treatment,
                    'comments': sample.comments,
                    'files': [file.id for file in sample.files.all()],
                    'dilutionFactor': sample.dilution_factor,
                    'concentrationFacility': sample.concentration_facility,
                    'concentrationMethodFacility':
                        sample.concentration_determined_by_facility.name
                        if sample.concentration_determined_by_facility is
                        not None else '',
                    'concentrationMethodFacilityId':
                        sample.concentration_determined_by_facility.id
                        if sample.concentration_determined_by_facility is
                        not None else '',
                    'dateFacility': sample.date_facility.strftime('%d.%m.%Y')
                        if sample.date_facility is not None else '',
                    'sampleVolumeFacility': sample.sample_volume_facility,
                    'amountFacility': sample.amount_facility,
                    'sizeDistributionFacility':
                        sample.size_distribution_facility,
                    'commentsFacility': sample.comments_facility,
                    'qcResult': sample.qc_result,
                    'rnaQualityFacility': sample.rna_quality_facility,
                }
                for sample in request.samples.all()
            ]

            data += libraries_data + samples_data

        data = sorted(
            data,
            key=lambda x: (x['date'], x['recordType'], x['name']),
            reverse=True,
        )

        return data

    def save_library(self):
        """ Add new Library or update existing one """
        data = None
        mode = self.request.POST.get('mode')

        if self.request.method == 'POST':
            mode = self.request.POST.get('mode')
            library_id = self.request.POST.get('library_id')
            files = json.loads(self.request.POST.get('files'))

            if mode == 'add':
                form = LibraryForm(self.request.POST)
            elif mode == 'edit':
                lib = Library.objects.get(id=library_id)
                form = LibraryForm(self.request.POST, instance=lib)

            if form.is_valid():
                lib = form.save()

                if mode == 'add':
                    lib.files.add(*files)
                    data = [{
                        'name': lib.name,
                        'recordType': 'L',
                        'libraryId': lib.id
                    }]

                elif mode == 'edit':
                    # import pdb; pdb.set_trace()
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
                error = 'Form is invalid'
                print('[ERROR]: save_sample/: %s' % form.errors.as_data())
                logger.debug(form.errors.as_data())

        return data

    def delete_library(self):
        """ Delete Library with a given id """
        record_id = self.request.POST.get('record_id')
        record = Library.objects.get(id=record_id)
        for file in record.files.all():
            file.delete()
        record.delete()
        return None


class SampleField(View):
    """ Base class for Sample field views """

    def get(self, request):
        error = str()
        data = []

        try:
            # Call one of the class methods
            data = getattr(self, resolve(request.path).url_name)()

            try:
                if data and 'name' in data[0].keys():
                    # Move 'Other' option to the end of list
                    index = next(
                        index
                        for (index, d) in enumerate(data)
                        if d['name'] == 'Other'
                    )
                    data += [data.pop(index)]
            except StopIteration:
                pass

        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(
            json.dumps({
                'success': not error,
                'error': error,
                'data': data,
            }),
            content_type='application/json',
        )

    @staticmethod
    def get_nucleic_acid_types():
        """ Get the list of all nucleic acid types """
        nucleic_acid_types = NucleicAcidType.objects.all()
        data = [
            {
                'id': item.id,
                'name': item.name,
                'type': item.type,
            }
            for item in nucleic_acid_types
        ]
        return data

    def get_sample_protocols(self):
        """ Get the list of all sample protocols """
        sample_type = self.request.GET.get('type')
        sample_protocols = SampleProtocol.objects.filter(type=sample_type)
        data = [
            {
                'id': item.id,
                'name': item.name,
                'type': item.type,
                'provider': item.provider,
                'catalog': item.catalog,
                'explanation': item.explanation,
                'inputRequirements': item.input_requirements,
                'typicalApplication': item.typical_application,
                'comments': item.comments,
            }
            for item in sample_protocols
        ]
        return data

    @staticmethod
    def get_rna_qualities():
        """ Get the list of all rna qialities """
        qualities = RNAQuality.objects.all()
        return get_simple_field_dict(qualities)


class SampleView(View):
    """ """

    def get(self, request):
        error = str()
        data = []

        try:
            data = getattr(self, resolve(request.path).url_name)()
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(
            json.dumps({
                'success': not error,
                'error': error,
                'data': data,
            }),
            content_type='application/json',
        )

    def post(self, request):
        """ Save Sample """
        error = str()
        data = None

        try:
            data = getattr(self, resolve(request.path).url_name)()
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        result = {
            'success': not error,
            'error': error,
        }
        if data:
            result.update({'data': data})

        return HttpResponse(
            json.dumps(result),
            content_type='application/json',
        )

    def save_sample(self):
        """ Add new Sample or update existing one """
        data = None
        
        if self.request.method == 'POST':
            mode = self.request.POST.get('mode')
            sample_id = self.request.POST.get('sample_id')
            files = json.loads(self.request.POST.get('files'))

            if mode == 'add':
                form = SampleForm(self.request.POST)
            elif mode == 'edit':
                smpl = Sample.objects.get(id=sample_id)
                form = SampleForm(self.request.POST, instance=smpl)

            if form.is_valid():
                smpl = form.save()

                if mode == 'add':
                    smpl.files.add(*files)
                    data = [{
                        'name': smpl.name,
                        'recordType': 'S',
                        'sampleId': smpl.id
                    }]

                elif mode == 'edit':
                    # import pdb; pdb.set_trace()
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
                error = 'Form is invalid'
                print('[ERROR]: save_sample/: %s' % form.errors.as_data())
                logger.debug(form.errors.as_data())

        return data

    def delete_sample(self):
        """ Delete Sample with a given id """
        record_id = self.request.POST.get('record_id')
        record = Sample.objects.get(id=record_id)
        for file in record.files.all():
            file.delete()
        record.delete()
        return None


@csrf_exempt
@login_required
def upload_file_sample(request):
    """ """
    error = ''
    file_ids = []

    if request.method == 'POST' and any(request.FILES):
        try:
            for file in request.FILES.getlist('files'):
                f = FileSample(name=file.name, file=file)
                f.save()
                file_ids.append(f.id)
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'fileIds': file_ids,
        }),
        content_type='application/json',
    )


@login_required
def get_file_sample(request):
    """ """

    error = ''
    data = []

    try:
        file_ids = json.loads(request.GET.get('file_ids'))
        files = [f for f in FileSample.objects.all() if f.id in file_ids]
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
        print('[ERROR]: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data,
        }),
        content_type='application/json',
    )


@csrf_exempt
@login_required
def upload_file_library(request):
    """ """
    error = ''
    file_ids = []

    if request.method == 'POST' and any(request.FILES):
        try:
            for file in request.FILES.getlist('files'):
                f = FileLibrary(name=file.name, file=file)
                f.save()
                file_ids.append(f.id)
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'fileIds': file_ids,
        }),
        content_type='application/json',
    )


@login_required
def get_file_library(request):
    """ """
    error = ''
    data = []

    try:
        file_ids = json.loads(request.GET.get('file_ids'))
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
        print('[ERROR]: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data,
        }),
        content_type='application/json',
    )


def qc_incoming_libraries(request):
    """ """
    error = ''

    try:
        record_type = request.POST.get('record_type')
        record_id = request.POST.get('record_id')
        dilution_factor = request.POST.get('dilution_factor')
        dilution_factor = int(dilution_factor) \
            if dilution_factor != '' else None
        concentration_facility = request.POST.get('concentration_facility')
        concentration_facility = float(concentration_facility) \
            if concentration_facility != '' else None
        concentration_method_facility_id = \
            request.POST.get('concentration_method_facility_id')
        sample_volume_facility = request.POST.get('sample_volume_facility')
        sample_volume_facility = int(sample_volume_facility) \
            if sample_volume_facility != '' else None
        amount_facility = request.POST.get('amount_facility')
        amount_facility = float(amount_facility) \
            if amount_facility != '' else None
        qpcr_result_facility = request.POST.get('qpcr_result_facility')
        qpcr_result_facility = float(qpcr_result_facility) \
            if qpcr_result_facility != '' else None
        rna_quality_facility = request.POST.get('rna_quality_facility')
        rna_quality_facility = float(rna_quality_facility) \
            if rna_quality_facility != '' else None
        size_distribution_facility = \
            request.POST.get('size_distribution_facility')
        comments_facility = request.POST.get('comments_facility')
        qc_result = request.POST.get('qc_result')

        if record_type == 'L':
            obj = Library.objects.get(id=record_id)
            obj.qpcr_result_facility = qpcr_result_facility
        else:
            obj = Sample.objects.get(id=record_id)
            obj.rna_quality_facility = rna_quality_facility
        obj.dilution_factor = dilution_factor
        obj.concentration_facility = concentration_facility
        obj.concentration_determined_by_facility_id = \
            concentration_method_facility_id
        obj.sample_volume_facility = sample_volume_facility
        obj.amount_facility = amount_facility
        obj.size_distribution_facility = size_distribution_facility
        obj.comments_facility = comments_facility
        obj.qc_result = qc_result
        obj.save()

    except Exception as e:
        error = str(e)
        print('[ERROR]: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )
