from django.http import HttpResponse
from library.models import LibraryProtocol, LibraryType, Organism

import json
import logging

logger = logging.getLogger('db')


def get_library_protocols(request):
    """ Get the list of all library protocols """
    error = str()
    data = []

    try:
        library_protocols = LibraryProtocol.objects.all()
        data = [{'name': protocol.name, 'libraryProtocolId': protocol.id, 'provider': protocol.provider}
                for protocol in library_protocols]

        # Move 'Other' option to the end of list
        index = next(index for (index, d) in enumerate(data) if d['name'] == 'Other')
        data += [data.pop(index)]
    except Exception as e:
        error = str(e)
        print('[ERROR]: get_library_protocols(): %s' % error)
        logger.debug(error)

    return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                        content_type='application/json')


def get_library_type(request):
    """ Get library type for a given library protocol id """
    error = str()
    data = []

    library_protocol_id = int(request.GET.get('library_protocol_id'))

    try:
        library_protocol = LibraryProtocol.objects.get(id=library_protocol_id)
        library_types = LibraryType.objects.filter(library_protocol__in=[library_protocol])
        data = [{'name': lib_type.name, 'libraryTypeId': lib_type.id}
                for lib_type in library_types]
        index = next(index for (index, d) in enumerate(data) if d['name'] == 'Other')
        data += [data.pop(index)]
    except Exception as e:
        error = str(e)
        print('[ERROR]: get_library_types(): %s' % error)
        logger.debug(error)

    return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                        content_type='application/json')


def get_organisms(request):
    """ Get the list of all organisms """
    error = str()
    data = []

    try:
        organisms = Organism.objects.all()
        data = [{'name': organism.name, 'organismId': organism.id} for organism in organisms]

        # Move 'Other' option to the end of list
        index = next(index for (index, d) in enumerate(data) if d['name'] == 'Other')
        data += [data.pop(index)]
    except Exception as e:
        error = str(e)
        print('[ERROR]: get_organisms(): %s' % error)
        logger.debug(error)

    return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                        content_type='application/json')
