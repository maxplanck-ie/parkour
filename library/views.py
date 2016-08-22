from django.http import HttpResponse
from django.views.generic import View
from django.core.urlresolvers import resolve
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from library.models import LibraryProtocol, LibraryType, Organism, IndexType, IndexI7, IndexI5, ConcentrationMethod, \
    SequencingRunCondition, Library, NucleicAcidType, SampleProtocol, RNAQuality, Sample, FileSample
from common.utils import get_simple_field_dict

import json
import logging

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
                    index = next(index for (index, d) in enumerate(data) if d['name'] == 'Other')
                    data += [data.pop(index)]
            except StopIteration:
                pass

        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                            content_type='application/json')

    @staticmethod
    def get_library_protocols():
        """ Get the list of all library protocols """
        library_protocols = LibraryProtocol.objects.all()
        data = [{'id': protocol.id, 'name': protocol.name, 'provider': protocol.provider}
                for protocol in library_protocols]
        return data

    def get_library_type(self):
        """ Get library type for a given library protocol id """
        library_protocol_id = self.request.GET.get('library_protocol_id')
        library_protocol = LibraryProtocol.objects.get(id=library_protocol_id)
        library_types = LibraryType.objects.filter(library_protocol__in=[library_protocol])
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
        data = [{'id': index.id, 'name': '%s - %s' % (index.index_id, index.index), 'index': index.index}
                for index in indices]
        data = sorted(data, key=lambda x: x['id'])
        return data

    def get_index_i5(self):
        """ Get the list of all indices i5 for a given index type """
        index_type = self.request.GET.get('index_type_id')
        indices = IndexI5.objects.filter(index_type=index_type)
        data = [{'id': index.id, 'name': '%s - %s' % (index.index_id, index.index), 'index': index.index}
                for index in indices]
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

        return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                            content_type='application/json')

    def post(self, request):
        """ Save Library """
        error = str()

        try:
            getattr(self, resolve(request.path).url_name)()
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(json.dumps({'success': not error, 'error': error}), content_type='application/json')

    @staticmethod
    def get_libraries():
        """ Get the list of all libraries and samples """

        libraries = Library.objects.select_related()
        libraries_data = [{
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
            'equalRepresentation': str(library.equal_representation_nucleotides),
            'DNADissolvedIn': library.dna_dissolved_in,
            'concentration': library.concentration,
            'concentrationMethod': library.concentration_determined_by.name,
            'concentrationMethodId': library.concentration_determined_by.id,
            'sampleVolume': library.sample_volume,
            'meanFragmentSize': library.mean_fragment_size,
            'qPCRResult': library.qpcr_result,
            'sequencingRunCondition': library.sequencing_run_condition.name,
            'sequencingRunConditionId': library.sequencing_run_condition.id,
            'sequencingDepth': library.sequencing_depth,
            'comments': library.comments
        } for library in libraries]

        samples = Sample.objects.select_related()
        samples_data = [{
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
            'equalRepresentation': str(sample.equal_representation_nucleotides),
            'DNADissolvedIn': sample.dna_dissolved_in,
            'concentration': sample.concentration,
            'concentrationMethod': sample.concentration_determined_by.name,
            'concentrationMethodId': sample.concentration_determined_by.id,
            'sampleVolume': sample.sample_volume,
            'sequencingRunCondition': sample.sequencing_run_condition.name,
            'sequencingRunConditionId': sample.sequencing_run_condition.id,
            'sequencingDepth': sample.sequencing_depth,
            'DNaseTreatment': str(sample.dnase_treatment),
            'rnaQuality': sample.rna_quality.name if sample.rna_quality else '',
            'rnaQualityId': sample.rna_quality_id if sample.rna_quality else '',
            'rnaSpikeIn': str(sample.rna_spike_in),
            'samplePreparationProtocol': sample.sample_preparation_protocol,
            'requestedSampleTreatment': sample.requested_sample_treatment,
            'comments': sample.comments
        } for sample in samples]

        data = sorted(libraries_data + samples_data, key=lambda x: (x['date'], x['recordType']))

        return data

    def save_library(self):
        """ Add new Library or update existing one """
        mode = self.request.POST.get('mode')
        name = self.request.POST.get('name')
        library_id = self.request.POST.get('library_id')
        library_protocol = self.request.POST.get('library_protocol')
        library_type = self.request.POST.get('library_type')
        enrichment_cycles = int(self.request.POST.get('enrichment_cycles'))
        organism = self.request.POST.get('organism')
        index_type = self.request.POST.get('index_type')
        index_reads = int(self.request.POST.get('index_reads'))
        index_i7 = self.request.POST.get('index_i7')
        index_i5 = self.request.POST.get('index_i5')
        equal_representation_nucleotides = json.loads(self.request.POST.get('equal_representation_nucleotides'))
        dna_dissolved_in = self.request.POST.get('dna_dissolved_in')
        concentration = float(self.request.POST.get('concentration'))
        concentration_determined_by = self.request.POST.get('concentration_determined_by')
        sample_volume = int(self.request.POST.get('sample_volume'))
        mean_fragment_size = int(self.request.POST.get('mean_fragment_size'))
        qpcr_result = float(self.request.POST.get('qpcr_result'))
        sequencing_run_condition = self.request.POST.get('sequencing_run_condition')
        sequencing_depth = int(self.request.POST.get('sequencing_depth'))
        comments = self.request.POST.get('comments')

        if mode == 'add':
            lib = Library(name=name, library_protocol_id=library_protocol, library_type_id=library_type,
                          enrichment_cycles=enrichment_cycles, organism_id=organism, index_type_id=index_type,
                          index_reads=index_reads, index_i7=index_i7, index_i5=index_i5,
                          equal_representation_nucleotides=equal_representation_nucleotides,
                          dna_dissolved_in=dna_dissolved_in, concentration=concentration,
                          concentration_determined_by_id=concentration_determined_by,
                          sample_volume=sample_volume, mean_fragment_size=mean_fragment_size,
                          qpcr_result=qpcr_result, sequencing_run_condition_id=sequencing_run_condition,
                          sequencing_depth=sequencing_depth, comments=comments)
            lib.save()
        elif mode == 'edit':
            lib = Library.objects.get(id=library_id)
            lib.name = name
            lib.library_protocol_id = library_protocol
            lib.library_type_id = library_type
            lib.enrichment_cycles = enrichment_cycles
            lib.organism_id = organism
            lib.index_type_id = index_type
            lib.index_reads = index_reads
            lib.index_i7 = index_i7
            lib.index_i5 = index_i5
            lib.equal_representation_nucleotides = equal_representation_nucleotides
            lib.dna_dissolved_in = dna_dissolved_in
            lib.concentration = concentration
            lib.concentration_determined_by_id = concentration_determined_by
            lib.sample_volume = sample_volume
            lib.mean_fragment_size = mean_fragment_size
            lib.qpcr_result = qpcr_result
            lib.sequencing_run_condition_id = sequencing_run_condition
            lib.sequencing_depth = sequencing_depth
            lib.comments = comments
            lib.save()

    def delete_library(self):
        """ Delete Library with a given id """
        record_id = self.request.POST.get('record_id')
        record = Library.objects.get(id=record_id)
        record.delete()


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
                    index = next(index for (index, d) in enumerate(data) if d['name'] == 'Other')
                    data += [data.pop(index)]
            except StopIteration:
                pass

        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                            content_type='application/json')

    @staticmethod
    def get_nucleic_acid_types():
        """ Get the list of all nucleic acid types """
        nucleic_acid_types = NucleicAcidType.objects.all()
        data = [{'id': item.id, 'name': item.name, 'type': item.type} for item in nucleic_acid_types]
        return data

    def get_sample_protocols(self):
        """ Get the list of all sample protocols """
        sample_type = self.request.GET.get('type')
        sample_protocols = SampleProtocol.objects.filter(type=sample_type)
        data = [{'id': item.id, 'name': item.name, 'type': item.type, 'provider': item.provider,
                 'catalog': item.catalog, 'explanation': item.explanation,
                 'inputRequirements': item.input_requirements, 'typicalApplication': item.typical_application,
                 'comments': item.comments} for item in sample_protocols]
        return data

    @staticmethod
    def get_rna_qualities():
        """ Get the list of all rna qialities """
        qualities = RNAQuality.objects.all()
        return get_simple_field_dict(qualities)


class SampleView(View):
    def get(self, request):
        error = str()
        data = []

        try:
            data = getattr(self, resolve(request.path).url_name)()
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                            content_type='application/json')

    def post(self, request):
        """ Save Sample """
        error = str()

        try:
            getattr(self, resolve(request.path).url_name)()
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(json.dumps({'success': not error, 'error': error}), content_type='application/json')

    def save_sample(self):
        """ Add new Sample or update existing one """
        mode = self.request.POST.get('mode')
        name = self.request.POST.get('name')
        sample_id = self.request.POST.get('sample_id')
        nucleic_acid_type_id = self.request.POST.get('nucleic_acid_type_id')
        sample_protocol_id = self.request.POST.get('sample_protocol_id')
        organism_id = self.request.POST.get('organism_id')
        equal_representation_nucleotides = json.loads(self.request.POST.get('equal_representation_nucleotides'))
        dna_dissolved_in = self.request.POST.get('dna_dissolved_in')
        concentration = float(self.request.POST.get('concentration'))
        concentration_determined_by_id = self.request.POST.get('concentration_determined_by_id')
        sample_volume = self.request.POST.get('sample_volume')
        sample_amplified_cycles = int(self.request.POST.get('sample_amplified_cycles'))
        dnase_treatment = None if self.request.POST.get('dnase_treatment') == '' else \
            json.loads(self.request.POST.get('dnase_treatment'))
        rna_quality_id = self.request.POST.get('rna_quality_id')
        rna_spike_in = None if self.request.POST.get('rna_spike_in') == '' else \
            json.loads(self.request.POST.get('rna_spike_in'))
        sample_preparation_protocol = self.request.POST.get('sample_preparation_protocol')
        requested_sample_treatment = self.request.POST.get('requested_sample_treatment')
        sequencing_run_condition_id = self.request.POST.get('sequencing_run_condition_id')
        sequencing_depth = int(self.request.POST.get('sequencing_depth'))
        comments = self.request.POST.get('comments')

        if mode == 'add':
            smpl = Sample(name=name, nucleic_acid_type_id=nucleic_acid_type_id, sample_protocol_id=sample_protocol_id,
                          organism_id=organism_id, equal_representation_nucleotides=equal_representation_nucleotides,
                          dna_dissolved_in=dna_dissolved_in, concentration=concentration,
                          concentration_determined_by_id=concentration_determined_by_id, sample_volume=sample_volume,
                          amplified_cycles=sample_amplified_cycles, dnase_treatment=dnase_treatment,
                          rna_quality_id=rna_quality_id, rna_spike_in=rna_spike_in,
                          sample_preparation_protocol=sample_preparation_protocol,
                          requested_sample_treatment=requested_sample_treatment,
                          sequencing_run_condition_id=sequencing_run_condition_id, sequencing_depth=sequencing_depth,
                          comments=comments)
            smpl.save()
        elif mode == 'edit':
            smpl = Sample.objects.get(id=sample_id)
            smpl.name = name
            smpl.nucleic_acid_type_id = nucleic_acid_type_id
            smpl.sample_protocol_id = sample_protocol_id
            smpl.organism_id = organism_id
            smpl.equal_representation_nucleotides = equal_representation_nucleotides
            smpl.dna_dissolved_in = dna_dissolved_in
            smpl.concentration = concentration
            smpl.concentration_determined_by_id = concentration_determined_by_id
            smpl.sample_volume = sample_volume
            smpl.amplified_cycles = sample_amplified_cycles
            smpl.dnase_treatment = dnase_treatment
            smpl.rna_quality_id = rna_quality_id
            smpl.rna_spike_in = rna_spike_in
            smpl.sample_preparation_protocol = sample_preparation_protocol
            smpl.requested_sample_treatment = requested_sample_treatment
            smpl.sequencing_run_condition_id = sequencing_run_condition_id
            smpl.sequencing_depth = sequencing_depth
            smpl.comments = comments
            smpl.save()

    def delete_sample(self):
        """ Delete Sample with a given id """
        record_id = self.request.POST.get('record_id')
        record = Sample.objects.get(id=record_id)
        record.delete()


@csrf_exempt
@login_required
def upload_file_sample(request):
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

    return HttpResponse(json.dumps({'success': not error, 'error': error, 'file_ids': file_ids}),
                        content_type='application/json')


@login_required
def get_file_sample(request):
    error = ''
    data = []

    try:
        file_ids = json.loads(request.GET.get('file_ids'))
        files = [f for f in FileSample.objects.all() if f.id in file_ids]
        data = [{
            'id': file.id,
            'name': file.name,
            'size': file.file.size
        } for file in files]
    except Exception as e:
        error = str(e)
        print('[ERROR]: %s' % error)
        logger.debug(error)

    return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                        content_type='application/json')
