import json
import logging

from django.http import JsonResponse
from django.views.generic.list import ListView
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route
# from rest_framework.permissions import IsAdminUser

from common.utils import JSONResponseMixin
from request.models import Request
from .models import Organism, LibraryProtocol, LibraryType, IndexType
from .serializers import (OrganismSerializer, IndexTypeSerializer,
                          LibraryProtocolSerializer, LibraryTypeSerializer)
from .utils import move_other_to_end

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


@login_required
def get_organisms(request):
    """ Get the list of organisms. """
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


@login_required
def get_index_types(request):
    """ Get the list of index types. """
    data = [
        {
            'id': index_type.pk,
            'name': index_type.name,
            'indexReads': [index_type.is_index_i7,
                           index_type.is_index_i5].count(True),
            'isDual': index_type.is_index_i7 and index_type.is_index_i5,
            'indexLength': int(index_type.get_index_length_display()),
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
                'indexId': index.index_id,
            }
            for index in indices
        ]
        data = sorted(data, key=lambda x: x['id'])
        return self.render_to_json_response(data, **response_kwargs)


@login_required
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
        data = sorted(data, key=lambda x: x['name'])

        # Move the 'Other' option to the end of the list
        # other = [x for x in data if 'Other' in x['name']]
        other_options = sorted([
            x for x in data
            if x['name'] == 'Other - DNA Methods' or
            x['name'] == 'Other - RNA Methods'
        ], key=lambda x: x['name'])

        for other in other_options:
            index = data.index(other)
            data.append(data.pop(index))

    return JsonResponse(data, safe=False)


@login_required
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


# class OrganismViewSet(viewsets.ViewSet):
#     """ Get the list of organisms. """

#     def list(self, request):
#         queryset = Organism.objects.all()
#         serializer = OrganismSerializer(queryset, many=True)
#         data = move_other_to_end(serializer.data)
#         return Response(data)


class OrganismViewSet(viewsets.ReadOnlyModelViewSet):
    """ Get the list of organisms. """
    queryset = Organism.objects.all()
    serializer_class = OrganismSerializer


class IndexTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """ Get the list of index types. """
    queryset = IndexType.objects.all()
    serializer_class = IndexTypeSerializer


class LibraryProtocolViewSet(viewsets.ReadOnlyModelViewSet):
    """ Get the list of library protocols. """
    serializer_class = LibraryProtocolSerializer
    # permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = LibraryProtocol.objects.all()
        na_type = self.request.query_params.get('type', None)
        if na_type is not None:
            queryset = queryset.filter(type=na_type)
        return queryset


class LibraryTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """ Get the list of library types. """
    serializer_class = LibraryTypeSerializer

    def get_queryset(self):
        queryset = LibraryType.objects.all()
        library_protocol = self.request.query_params.get(
            'library_protocol_id', None)
        if library_protocol is not None:
            try:
                queryset = queryset.filter(
                    library_protocol__in=[library_protocol])
            except ValueError:
                queryset = []
        return queryset


class LibrarySampleBaseViewSet(viewsets.ViewSet):

    def list(self, request):
        """ Get the list of all libraries/samples. """
        data = []
        requests_queryset = Request.objects.order_by('-create_time')
        if not request.user.is_staff:
            requests_queryset = requests_queryset.filter(user=request.user)
        for request_obj in requests_queryset:
            # TODO: sort by item['barcode'][3:]
            records = getattr(request_obj, self.model_name_plural.lower())
            serializer = self.serializer_class(
                records.order_by('barcode'), many=True)
            data += serializer.data
        return Response(data)

    def create(self, request):
        """ Add new libraries/samples. """
        post_data = json.loads(request.POST.get('data', '[]'))

        if not post_data:
            return Response({
                'success': False,
                'message': 'Invalid payload.',
            }, 400)

        serializer = self.serializer_class(data=post_data, many=True)
        if serializer.is_valid():
            objects = serializer.save()
            data = [{
                'name': obj.name,
                'record_type': self.record_type,
                self.id_key: obj.pk,
                'barcode': obj.barcode
            } for obj in objects]
            return Response({'success': True, 'data': data}, 201)

        else:
            # Try to create valid records
            valid_data = [item[1] for item in zip(serializer.errors, post_data)
                          if not item[0]]

            if any(valid_data):
                message = 'Invalid payload. Some records cannot be added.'
                objects = self._create_or_update_valid(valid_data)

                data = [{
                    'name': obj.name,
                    'record_type': self.record_type,
                    self.id_key: obj.pk,
                    'barcode': obj.barcode
                } for obj in objects]

                return Response({
                    'success': True,
                    'message': message,
                    'data': data,
                }, 201)

            else:
                # logger.debug('POST DATA', post_data)
                # logger.debug('VALIDATION ERRORS', serializer.errors)
                return Response({
                    'success': False,
                    'message': 'Invalid payload.',
                }, 400)

    def retrieve(self, request, pk=None):
        """ Get a library/sample with a given id. """
        try:
            obj = self.model_class.objects.get(pk=int(pk))
            serializer = self.serializer_class(obj)
            return Response({
                'success': True,
                'data': serializer.data
            })

        except ValueError:
            return Response({
                'success': False,
                'message': 'Id is not provided.',
            }, 400)

        except self.model_class.DoesNotExist:
            return Response({
                'success': False,
                'message': '%s does not exist.' % self.model_name,
            }, 404)

    @list_route(methods=['post'])
    def edit(self, request):
        """ Update multiple libraries/samples. """
        post_data = json.loads(request.POST.get('data', '[]'))

        if not post_data:
            return Response({
                'success': False,
                'message': 'Invalid payload.',
            }, 400)

        ids = [x[self.id_key] for x in post_data]
        objects = self.model_class.objects.filter(pk__in=ids)
        serializer = self.serializer_class(data=post_data, instance=objects,
                                           many=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True})

        else:
            # Try to update valid records
            valid_data = [item[1] for item in zip(serializer.errors, post_data)
                          if not item[0]]

            if any(valid_data):
                message = 'Invalid payload. Some records cannot be updated.'
                ids = [x[self.id_key] for x in valid_data]
                self._create_or_update_valid(valid_data, ids)
                return Response({'success': True, 'message': message}, 200)

            else:
                return Response({
                    'success': False,
                    'message': 'Invalid payload.',
                }, 400)

    # @list_route(methods=['post'])
    # def delete(self, request):
    #     pass

    def destroy(self, request, pk=None):
        """ Delete a library/sample with a given id. """
        try:
            obj = self.model_class.objects.get(pk=int(pk))
            obj.delete()
            return Response({'success': True})

        except ValueError:
            return Response({
                'success': False,
                'message': 'Id is not provided.',
            }, 400)

        except self.model_class.DoesNotExist:
            return Response({
                'success': False,
                'message': '%s does not exist.' % self.model_name,
            }, 404)

    def _create_or_update_valid(self, valid_data, ids=None):
        """ Create or update objects valid objects. """
        if not ids:
            serializer = self.serializer_class(data=valid_data, many=True)
        else:
            objects = self.model_class.objects.filter(pk__in=ids)
            serializer = self.serializer_class(
                data=valid_data, instance=objects, many=True)
        serializer.is_valid()
        return serializer.save()
