from django.http import HttpResponse
from django.views.generic import View
from django.core.urlresolvers import resolve
from library.models import LibraryProtocol, LibraryType, Organism, IndexType, IndexI7, IndexI5

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
        data = [{'name': protocol.name, 'libraryProtocolId': protocol.id, 'provider': protocol.provider}
                for protocol in library_protocols]
        return data

    def get_library_type(self):
        """ Get library type for a given library protocol id """
        library_protocol_id = self.request.GET.get('library_protocol_id')
        library_protocol = LibraryProtocol.objects.get(id=library_protocol_id)
        library_types = LibraryType.objects.filter(library_protocol__in=[library_protocol])
        data = [{'name': lib_type.name, 'libraryTypeId': lib_type.id} for lib_type in library_types]
        return data

    @staticmethod
    def get_organisms():
        """ Get the list of all organisms """
        organisms = Organism.objects.all()
        data = [{'name': organism.name, 'organismId': organism.id} for organism in organisms]
        return data

    @staticmethod
    def get_index_types():
        """ Get the list of all index types """
        index_types = IndexType.objects.all()
        data = [{'name': index_type.name, 'indexTypeId': index_type.id} for index_type in index_types]
        return data

    def get_index_i7(self):
        """ Get the list of all indices i7 for a given index type """
        index_type = self.request.GET.get('index_type_id')
        indices = IndexI7.objects.filter(index_type=index_type)
        data = [{'indexId': index.id, 'index': '%s - %s' % (index.index_id, index.index), } for index in indices]
        return data

    def get_index_i5(self):
        """ Get the list of all indices i5 for a given index type """
        index_type = self.request.GET.get('index_type_id')
        indices = IndexI5.objects.filter(index_type=index_type)
        data = [{'indexId': index.id, 'index': '%s - %s' % (index.index_id, index.index), } for index in indices]
        return data

    def save_library(self):
        """ Save library """

        library_name = self.request.GET.get('library_name')
        library_protocol = self.request.GET.get('library_protocol')
        library_type = self.request.GET.get('library_type')
        enrichment_cycles = int(self.request.GET.get('enrichment_cycles'))
        organism = self.request.GET.get('organism')
        index_type = self.request.GET.get('index_type')
        index_reads = int(self.request.GET.get('index_reads'))
        index_i7 = self.request.GET.get('index_i7')
        index_i5 = self.request.GET.get('index_i5')
        equal_representation_nucleotides = bool(self.request.GET.get('equal_representation_nucleotides'))
        dna_dissolved_in = self.request.GET.get('dna_dissolved_in')
        concentration = float(self.request.GET.get('concentration'))
        concentration_determined_by = self.request.GET.get('concentration_determined_by')
        sample_volume = int(self.request.GET.get('sample_volume'))
        qpcr_result = float(self.request.GET.get('qpcr_result'))
        sequencing_run_condition = self.request.GET.get('sequencing_run_condition')
        sequencing_depth = int(self.request.GET.get('sequencing_depth'))
        comments = self.request.GET.get('comments')

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

        return []
