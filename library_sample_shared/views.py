import logging

from django.http import JsonResponse
from django.views.generic.list import ListView

from common.utils import JSONResponseMixin
from .models import LibraryProtocol, LibraryType

logger = logging.getLogger('db')


class SimpleStoreView(JSONResponseMixin, ListView):
    """ Base class for simple Ext JS stores (with "id" and "name" only). """
    def render_to_response(self, context, **response_kwargs):
        response_kwargs['safe'] = False
        data = [
            {
                'id': obj.id,
                'name': obj.name
            }
            for obj in context.pop('object_list')
        ]

        return self.render_to_json_response(data, **response_kwargs)


class IndexStoreView(JSONResponseMixin, ListView):
    """ Base class for IndexI7/IndexI5 stores. """
    def render_to_response(self, context, **response_kwargs):
        response_kwargs['safe'] = False

        index_type = int(self.request.GET.get('index_type_id'))
        all_indices = context.pop('object_list')
        indices = all_indices.filter(index_type=index_type)

        data = [
            {
                'id': index.id,
                'name': '%s - %s' % (index.index_id, index.index),
                'index': index.index,
            }
            for index in indices
        ]
        data = sorted(data, key=lambda x: x['id'])
        return self.render_to_json_response(data, **response_kwargs)


def get_library_protocols(request):
    """ Get the list of all library protocols. """
    data = []

    if request.method == 'GET':
        sample_type = request.GET.get('type', '')
        library_protocols = LibraryProtocol.objects.filter(type=sample_type)

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
            for protocol in library_protocols
        ]

    return JsonResponse(data, safe=False)


def get_library_types(request):
    """ Get the list of all library types for a given library protocol. """
    data = []

    try:
        library_protocol_id = request.GET.get('library_protocol_id', '')
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
