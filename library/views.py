from django.http import HttpResponse
from django.views.generic import View, DetailView
from django.core.urlresolvers import resolve
from library.models import LibraryProtocol, LibraryType, Organism, IndexType, IndexI7, IndexI5, ConcentrationMethod, \
    SequencingRunCondition, Library

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
        data = [{'id': lib_type.id, 'name': lib_type.name} for lib_type in library_types]
        return data

    @staticmethod
    def get_organisms():
        """ Get the list of all organisms """
        organisms = Organism.objects.all()
        data = [{'id': organism.id, 'name': organism.name} for organism in organisms]
        return data

    @staticmethod
    def get_index_types():
        """ Get the list of all index types """
        index_types = IndexType.objects.all()
        data = [{'id': index_type.id, 'name': index_type.name} for index_type in index_types]
        return data

    def get_index_i7(self):
        """ Get the list of all indices i7 for a given index type """
        index_type = self.request.GET.get('index_type_id')
        indices = IndexI7.objects.filter(index_type=index_type)
        data = [{'id': index.id, 'index': '%s - %s' % (index.index_id, index.index), } for index in indices]
        return data

    def get_index_i5(self):
        """ Get the list of all indices i5 for a given index type """
        index_type = self.request.GET.get('index_type_id')
        indices = IndexI5.objects.filter(index_type=index_type)
        data = [{'id': index.id, 'index': '%s - %s' % (index.index_id, index.index), } for index in indices]
        return data

    @staticmethod
    def get_concentration_methods():
        """ Get the list of all concentration methods """
        methods = ConcentrationMethod.objects.all()
        data = [{'id': method.id, 'name': method.name} for method in methods]
        return data

    @staticmethod
    def get_sequencing_run_conditions():
        """  Get the list of all sequencing run conditions """
        methods = SequencingRunCondition.objects.all()
        data = [{'id': method.id, 'name': method.name} for method in methods]
        return data


class LibraryView(View):
    def get(self, request):
        """ Get the list of all libraries """
        error = str()
        data = []

        try:
            libraries = Library.objects.select_related()
            data = [{
                        'id': library.id,
                        'libraryName': library.library_name,
                        'date': library.date.strftime('%d.%m.%Y'),
                        'libraryProtocol': library.library_protocol.name,
                        'libraryType': library.library_type.name,
                        'enrichmentCycles': library.enrichment_cycles,
                        'organism': library.organism.name,
                        'indexType': library.index_type.name,
                        'indexReads': library.index_reads,
                        'indexI7': library.index_i7,
                        'indexI5': library.index_i5,
                        'equalRepresentation': library.equal_representation_nucleotides,
                        'DNADissolvedIn': library.dna_dissolved_in,
                        'concentration': library.concentration,
                        'concentrationMethod': library.concentration_determined_by.name,
                        'sampleVolume': library.sample_volume,
                        'qPCRResult': library.qpcr_result,
                        'sequencingRunCondition': library.sequencing_run_condition.name,
                        'sequencingDepth': library.sequencing_depth,
                        'comments': library.comments
                    } for library in libraries]
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                            content_type='application/json')

    def post(self, request):
        """ Save Library """
        error = str()

        library_name = self.request.POST.get('library_name')
        library_protocol = self.request.POST.get('library_protocol')
        library_type = self.request.POST.get('library_type')
        enrichment_cycles = int(self.request.POST.get('enrichment_cycles'))
        organism = self.request.POST.get('organism')
        index_type = self.request.POST.get('index_type')
        index_reads = int(self.request.POST.get('index_reads'))
        index_i7 = self.request.POST.get('index_i7')
        index_i5 = self.request.POST.get('index_i5')
        equal_representation_nucleotides = bool(self.request.POST.get('equal_representation_nucleotides'))
        dna_dissolved_in = self.request.POST.get('dna_dissolved_in')
        concentration = float(self.request.POST.get('concentration'))
        concentration_determined_by = self.request.POST.get('concentration_determined_by')
        sample_volume = int(self.request.POST.get('sample_volume'))
        qpcr_result = float(self.request.POST.get('qpcr_result'))
        sequencing_run_condition = self.request.POST.get('sequencing_run_condition')
        sequencing_depth = int(self.request.POST.get('sequencing_depth'))
        comments = self.request.POST.get('comments')

        if index_i7:
            try:
                index_i7 = IndexI7.objects.get(id=int(index_i7)).index
            except ValueError:
                pass

        if index_i5:
            try:
                index_i5 = IndexI5.objects.get(id=int(index_i5)).index
            except ValueError:
                pass

        try:
            library = Library(library_name=library_name, library_protocol_id=library_protocol,
                              library_type_id=library_type, enrichment_cycles=enrichment_cycles,
                              organism_id=organism, index_type_id=index_type, index_reads=index_reads,
                              index_i7=index_i7, index_i5=index_i5,
                              equal_representation_nucleotides=equal_representation_nucleotides,
                              dna_dissolved_in=dna_dissolved_in, concentration=concentration,
                              concentration_determined_by_id=concentration_determined_by,
                              sample_volume=sample_volume, qpcr_result=qpcr_result,
                              sequencing_run_condition_id=sequencing_run_condition,
                              sequencing_depth=sequencing_depth, comments=comments)
            library.save()
        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

        return HttpResponse(json.dumps({'success': not error, 'error': error}), content_type='application/json')
