# from datetime import datetime
from collections import Counter

from django.apps import apps
from django.db.models import Prefetch

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

# from common.utils import print_sql_queries

Request = apps.get_model('request', 'Request')
LibraryType = apps.get_model('library_sample_shared', 'LibraryType')
Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')


class RecordsUsage(APIView):
    permission_classes = (IsAdminUser,)

    # @print_sql_queries
    def get(self, request):
        libraries = Library.objects.filter(request__isnull=False).only('id')
        samples = Sample.objects.filter(request__isnull=False).only('id')
        return Response([
            {
                'name': 'Libraries',
                'data': len(libraries),
            },
            {
                'name': 'Samples',
                'data': len(samples),
            },
        ])


class OrganizationsUsage(APIView):
    permission_classes = (IsAdminUser,)

    # @print_sql_queries
    def get(self, request):
        libraries_qs = Library.objects.only('id')
        samples_qs = Sample.objects.only('id')

        requests = Request.objects.select_related(
            'user', 'user__organization',
        ).prefetch_related(
            Prefetch('libraries', queryset=libraries_qs,
                     to_attr='fetched_libraries'),
            Prefetch('samples', queryset=samples_qs,
                     to_attr='fetched_samples'),
        ).only('id', 'user', 'libraries', 'samples')

        counts = {}
        for req in requests:
            organization = req.user.organization
            org_name = organization.name if organization else 'None'
            if org_name not in counts.keys():
                counts[org_name] = {'libraries': 0, 'samples': 0}
            counts[org_name]['libraries'] += len(req.fetched_libraries)
            counts[org_name]['samples'] += len(req.fetched_samples)

        data = [{
            'name': organization,
            'data': sum(count.values())
        } for organization, count in counts.items()]

        return Response(data)


class PrincipalInvestigatorsUsage(APIView):
    permission_classes = (IsAdminUser,)

    # @print_sql_queries
    def get(self, request):
        libraries_qs = Library.objects.only('id')
        samples_qs = Sample.objects.only('id')

        requests = Request.objects.select_related(
            'user', 'user__pi',
        ).prefetch_related(
            Prefetch('libraries', queryset=libraries_qs,
                     to_attr='fetched_libraries'),
            Prefetch('samples', queryset=samples_qs,
                     to_attr='fetched_samples'),
        ).only('id', 'user__pi__name', 'libraries', 'samples')

        counts = {}
        for req in requests:
            pi = req.user.pi
            pi_name = pi.name if pi else 'None'
            if pi_name not in counts.keys():
                counts[pi_name] = {'libraries': 0, 'samples': 0}
            counts[pi_name]['libraries'] += len(req.fetched_libraries)
            counts[pi_name]['samples'] += len(req.fetched_samples)

        data = [{
            'name': pi,
            'data': sum(count.values()),
            'libraries': count['libraries'],
            'samples': count['samples'],
        } for pi, count in counts.items()]

        data = sorted(data, key=lambda x: x['name'])
        return Response(data)


class LibraryTypesUsage(APIView):
    permission_classes = (IsAdminUser,)

    # @print_sql_queries
    def get(self, request):
        libraries_qs = Library.objects.select_related(
            'library_type').only('id', 'library_type__name')
        samples_qs = Sample.objects.select_related(
            'library_type').only('id', 'library_type__name')

        requests = Request.objects.prefetch_related(
            Prefetch('libraries', queryset=libraries_qs,
                     to_attr='fetched_libraries'),
            Prefetch('samples', queryset=samples_qs,
                     to_attr='fetched_samples'),
        ).only('id', 'libraries', 'samples')

        counts = {}
        for req in requests:
            # Extract Library Type
            library_types = [
                x.library_type.name for x in req.fetched_libraries]
            sample_types = [
                x.library_type.name for x in req.fetched_samples]

            # Merge the counts
            library_cnt = {x[0]: {'libraries': x[1]}
                           for x in Counter(library_types).items()}
            sample_cnt = {x[0]: {'samples': x[1]}
                          for x in Counter(sample_types).items()}
            count = {
                k: {
                    **library_cnt.get(k, {'libraries': 0}),
                    **sample_cnt.get(k, {'samples': 0}),
                }
                for k in library_cnt.keys() | sample_cnt.keys()
            }

            for k, v in count.items():
                temp_dict = counts.get(k, {'libraries': 0, 'samples': 0})
                temp_dict['libraries'] += v['libraries']
                temp_dict['samples'] += v['samples']
                counts[k] = temp_dict

        data = [{
            'name': library_type,
            'data': sum(count.values()),
            'libraries': count['libraries'],
            'samples': count['samples'],
        } for library_type, count in counts.items()]

        data = sorted(data, key=lambda x: x['name'])
        return Response(data)
