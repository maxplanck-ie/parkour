from django.http import HttpResponse
from django.views.generic import View
from django.core.urlresolvers import resolve
from library.models import LibraryProtocol, LibraryType, Organism, IndexType

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
