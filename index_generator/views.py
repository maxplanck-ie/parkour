import json
import logging
import itertools

from django.apps import apps
from django.http import JsonResponse
from django.db.models import Prefetch, Q
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework.permissions import IsAdminUser

from common.utils import print_sql_queries
from common.mixins import LibrarySampleMultiEditMixin

from .models import Pool, PoolSize
from .index_generator import IndexGenerator
# from .forms import LibraryResetForm, SampleResetForm
from .serializers import (
    PoolSizeSerializer,
    IndexGeneratorSerializer,
    IndexGeneratorLibrarySerializer,
    IndexGeneratorSampleSerializer,
)

Request = apps.get_model('request', 'Request')
IndexI7 = apps.get_model('library_sample_shared', 'IndexI7')
IndexI5 = apps.get_model('library_sample_shared', 'IndexI5')
Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')

logger = logging.getLogger('db')


def handle_exceptions(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, 400)
    return wrapper


class PoolSizeViewSet(viewsets.ReadOnlyModelViewSet):
    """ Get the list of pool sizes. """
    queryset = PoolSize.objects.all()
    serializer_class = PoolSizeSerializer


@login_required
@staff_member_required
def save_pool(request):
    """
    Create a pool after generating indices, add libraries and "converted"
    samples to it, update the pool size, and create a Library Preparation
    object and a Pooling object for each added library/sample.
    """
    error = ''

    if request.method == 'POST':
        pool_size_id = request.POST.get('pool_size_id', None)
        library_ids = [
            library_id
            for library_id in json.loads(request.POST.get('libraries', '[]'))
        ]
        samples = [s for s in json.loads(request.POST.get('samples', '[]'))]
        sample_ids = [sample['sample_id'] for sample in samples]

        try:
            if not any(library_ids) and not any(sample_ids):
                raise ValueError('Neither libraries nor samples have been ' +
                                 'provided.')

            # Check for unique barcode combinations
            indices = set()
            for lib_id in library_ids:
                library = Library.objects.get(pk=lib_id)
                t = (library.index_i7, library.index_i5)
                if t in indices:
                    _ = t[1]
                    if _ == '':
                        _ = 'NA'
                    raise ValueError(
                        'The following barcodes are not unique ' +
                        f'I7 {t[0]} I5 {_}'
                    )
                indices.add(t)
            for sample in samples:
                idx_i7_id = sample['index_i7_id']
                idx_i5_id = sample['index_i5_id']
                index_i7 = IndexI7.objects.get(index_id=idx_i7_id).index \
                    if idx_i7_id else ''
                index_i5 = IndexI5.objects.get(index_id=idx_i5_id).index \
                    if idx_i5_id else ''
                t = (index_i7, index_i5)
                if t in indices:
                    _ = t[1]
                    if _ == '':
                        _ = 'NA'
                    raise ValueError(
                        'The following barcodes are not unique ' +
                        f'I7 {t[0]} I5 {_}'
                    )
                indices.add(t)

            pool = Pool(user=request.user, size_id=pool_size_id)
            pool.save()
            pool.libraries.add(*library_ids)
            pool.samples.add(*sample_ids)

            for sample in samples:
                smpl = Sample.objects.get(pk=sample['sample_id'])
                idx_i7_id = sample['index_i7_id']
                idx_i5_id = sample['index_i5_id']

                if idx_i7_id == '':
                    raise ValueError(f'Index I7 is not set for "{smpl.name}"')

                index_i7 = IndexI7.objects.get(index_id=idx_i7_id).index
                index_i5 = IndexI5.objects.get(index_id=idx_i5_id).index \
                    if idx_i5_id else ''

                # Update sample fields
                smpl.index_i7 = index_i7
                smpl.index_i5 = index_i5
                smpl.save()

        except Exception as e:
            error = str(e) if e.__class__ == ValueError \
                else 'Could not save Pool.'
            logger.exception(error)
    else:
        error = 'Wrong HTTP method.'

    return JsonResponse({'success': not error, 'error': error})


# @login_required
# @staff_member_required
# def reset(request):
#     """ Reset all record's values. """
#     error = ''
#     record_type = request.POST.get('record_type', '')
#     record_id = request.POST.get('record_id', '')

#     try:
#         if record_type == 'L':
#             library = Library.objects.get(pk=record_id)
#             form = LibraryResetForm(request.POST, instance=library)
#             if form.is_valid():
#                 form.save()
#             else:
#                 error = str(form.errors)

#         elif record_type == 'S':
#             sample = Sample.objects.get(pk=record_id)
#             form = SampleResetForm(request.POST, instance=sample)
#             if form.is_valid():
#                 form.save()
#             else:
#                 error = str(form.errors)

#         else:
#             raise ValueError('No Record Type is provided.')

#     except Exception as e:
#         error = str(e)
#         logger.exception(e)

#     return JsonResponse({'success': not error, 'error': error})


class IndexGeneratorViewSet(viewsets.ViewSet, LibrarySampleMultiEditMixin):
    permission_classes = [IsAdminUser]
    library_model = Library
    sample_model = Sample
    library_serializer = IndexGeneratorLibrarySerializer
    sample_serializer = IndexGeneratorSampleSerializer

    def list(self, request):
        """ Get the list of libraries and samples ready for pooling. """

        libraries_qs = Library.objects.select_related(
            'library_protocol', 'read_length', 'index_type',
        ).filter(
            Q(is_pooled=False) & Q(index_i7__isnull=False) &
            (Q(status=2) | Q(status=-2))
        ).only('id', 'name', 'barcode', 'index_i7', 'index_i5',
               'sequencing_depth', 'library_protocol__name',
               'read_length__id', 'index_type__id',)

        samples_qs = Sample.objects.select_related(
            'library_protocol', 'read_length', 'index_type',
        ).filter(
            Q(is_pooled=False) & (Q(status=2) | Q(status=-2))
        ).only('id', 'name', 'barcode', 'index_i7', 'index_i5',
               'sequencing_depth', 'library_protocol__name',
               'read_length__id', 'index_type__id',)

        queryset = Request.objects.prefetch_related(
            Prefetch('libraries', queryset=libraries_qs),
            Prefetch('samples', queryset=samples_qs),
        )

        serializer = IndexGeneratorSerializer(queryset, many=True)
        data = list(itertools.chain(*serializer.data))
        data = sorted(data, key=lambda x: x['barcode'][3:])
        return Response(data)

    @list_route(methods=['post'])
    @handle_exceptions
    def generate_indices(self, request):
        """ Generate indices for given libraries and samples. """
        library_ids = json.loads(request.data.get('libraries', '[]'))
        sample_ids = json.loads(request.data.get('samples', '[]'))
        index_generator = IndexGenerator(library_ids, sample_ids)
        data = index_generator.generate()
        return Response({'success': True, 'data': data})
