import logging

from django.http import JsonResponse
from django.views.generic.list import ListView

from common.utils import JSONResponseMixin
from .models import Organism, LibraryProtocol, LibraryType, IndexType

logger = logging.getLogger('db')


class SimpleStoreView(JSONResponseMixin, ListView):
    """ Base class for simple Ext JS stores (with "id" and "name" only). """
    def render_to_response(self, context, **response_kwargs):
        response_kwargs['safe'] = False
        data = [
            {
                'id': obj.pk,
                'name': obj.name
            }
            for obj in context.pop('object_list')
        ]

        return self.render_to_json_response(data, **response_kwargs)


def get_organisms(request):
    """ Get the lost of organisms. """
    data = [
        {
            'id': organism.pk,
            'name': organism.name
        }
        for organism in Organism.objects.all()
    ]

    # move 'Other' option to the end of the list
    other = [x for x in data if x['name'] == 'Other']
    if other:
        index = data.index(other[0])
        data.append(data.pop(index))

    return JsonResponse(data, safe=False)


def get_index_types(request):
    """ Get the list of index types. """
    data = [
        {
            'id': index_type.pk,
            'name': index_type.name,
            'indexReads': [index_type.is_index_i7,
                           index_type.is_index_i5].count(True)
        }
        for index_type in IndexType.objects.all()
    ]

    return JsonResponse(data, safe=False)


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
        na_type = request.GET.get('type', '')  # Nucleic Acid Type
        if na_type:
            library_protocols = LibraryProtocol.objects.filter(type=na_type)
        else:
            library_protocols = LibraryProtocol.objects.all()

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

        # move 'Other' option to the end of the list
        other = [x for x in data if x['name'] == 'Other']
        if other:
            index = data.index(other[0])
            data.append(data.pop(index))

    return JsonResponse(data, safe=False)


def get_library_types(request):
    """ Get the list of all library types. """
    data = []

    if request.method == 'GET':
        library_protocol_id = request.GET.get('library_protocol_id', '')

        if library_protocol_id:
            lib_protocol = LibraryProtocol.objects.get(pk=library_protocol_id)
            library_types = LibraryType.objects.filter(
                library_protocol__in=[lib_protocol]
            )

            protocol = {}
            for lib_type in library_types:
                protocol[lib_type.pk] = [lib_protocol.pk]

        else:
            library_types = LibraryType.objects.all()
            protocol = {}

            # Collect all library protocols for each library type
            for lib_type in library_types:
                protocol[lib_type.pk] = [
                    library_protocol.pk
                    for library_protocol in lib_type.library_protocol.all()
                ]

        data = [
            {
                'id': library_type.pk,
                'name': library_type.name,
                'protocol': protocol[library_type.pk]
            }
            for library_type in library_types
        ]

        # move 'Other' option to the end of the list
        other = [x for x in data if x['name'] == 'Other']
        if other:
            index = data.index(other[0])
            data.append(data.pop(index))

    return JsonResponse(data, safe=False)
