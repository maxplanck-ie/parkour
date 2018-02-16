from datetime import datetime
from collections import OrderedDict, Counter

from django.apps import apps
from django.shortcuts import render
from django.db.models import Q, Prefetch
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required

from common.utils import print_sql_queries

Organization = apps.get_model('common', 'Organization')
PrincipalInvestigator = apps.get_model('common', 'PrincipalInvestigator')
LibraryProtocol = apps.get_model(
    'library_sample_shared', 'LibraryProtocol')

Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')
Request = apps.get_model('request', 'Request')
Pool = apps.get_model('index_generator', 'Pool')
Sequencer = apps.get_model('flowcell', 'Sequencer')
Flowcell = apps.get_model('flowcell', 'Flowcell')
Lane = apps.get_model('flowcell', 'Lane')


class Report:
    def __init__(self):
        # TODO: date range filter
        libraries_qs = Library.objects.select_related(
            'library_protocol').only('id', 'library_protocol__name')

        # TODO: date range filter
        samples_qs = Sample.objects.select_related(
            'library_protocol').only('id', 'library_protocol__name')

        self.requests = Request.objects.select_related(
            'user__organization', 'user__pi',
        ).prefetch_related(
            Prefetch('libraries', queryset=libraries_qs,
                     to_attr='fetched_libraries'),
            Prefetch('samples', queryset=samples_qs,
                     to_attr='fetched_samples'),
        ).only(
            'id',
            'libraries',
            'samples',
            'user__organization__name',
            'user__pi__name',
        )

        lanes_qs = Lane.objects.select_related('pool').prefetch_related(
            Prefetch('pool__libraries', queryset=libraries_qs,
                     to_attr='fetched_libraries'),
            Prefetch('pool__samples', queryset=samples_qs,
                     to_attr='fetched_samples'),
        ).only('id', 'pool__libraries', 'pool__samples')

        self.flowcells = Flowcell.objects.select_related(
            'sequencer',
        ).prefetch_related(
            Prefetch('lanes', queryset=lanes_qs, to_attr='fetched_lanes'),
        ).only('id', 'sequencer__name', 'lanes')

    def get_total_counts(self):
        num_libraries = 0
        num_samples = 0

        for req in self.requests:
            num_libraries += len(req.fetched_libraries)
            num_samples += len(req.fetched_samples)

        return [
            {'type': 'Samples', 'count': num_samples},
            {'type': 'Libraries', 'count': num_libraries},
        ]

    def get_organization_counts(self):
        counts = {}

        for req in self.requests:
            organization = req.user.organization
            org_name = organization.name if organization else 'None'
            if org_name not in counts.keys():
                counts[org_name] = {'libraries': 0, 'samples': 0}
            counts[org_name]['libraries'] += len(req.fetched_libraries)
            counts[org_name]['samples'] += len(req.fetched_samples)

        return self._get_data(counts)

    def get_library_protocol_counts(self):
        counts = {}

        for req in self.requests:
            # Extract Library Protocols
            library_protocols = [
                x.library_protocol.name for x in req.fetched_libraries]
            sample_protocols = [
                x.library_protocol.name for x in req.fetched_samples]

            # Merge the counts
            library_cnt = {x[0]: {'libraries': x[1]}
                           for x in Counter(library_protocols).items()}
            sample_cnt = {x[0]: {'samples': x[1]}
                          for x in Counter(sample_protocols).items()}
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

        return self._get_data(counts)

    def get_pi_counts(self):
        counts = {}

        for req in self.requests:
            pi = req.user.pi
            pi_name = pi.name if pi else 'None'
            if pi_name not in counts.keys():
                counts[pi_name] = {'libraries': 0, 'samples': 0}
            counts[pi_name]['libraries'] += len(req.fetched_libraries)
            counts[pi_name]['samples'] += len(req.fetched_samples)

        return self._get_data(counts)

    def get_sequencer_counts(self):
        counts = {}

        for flowcell in self.flowcells:
            sequencer_name = flowcell.sequencer.name
            if sequencer_name not in counts.keys():
                counts[sequencer_name] = {
                    'libraries': 0, 'samples': 0, 'runs': 0}
            counts[sequencer_name]['runs'] += 1

            pools = {x.pool for x in flowcell.fetched_lanes}
            for pool in pools:
                counts[sequencer_name]['libraries'] += \
                    len(pool.fetched_libraries)
                counts[sequencer_name]['samples'] += \
                    len(pool.fetched_samples)

        data = [{
            'name': name,
            'items_count': count['libraries'] + count['samples'],
            'runs_count': count['runs'],
        } for name, count in counts.items()]

        return sorted(data, key=lambda x: x['name'])

    def get_sequencers_list(self):
        return sorted({x.sequencer.name for x in self.flowcells})

    def get_pi_sequencer_counts(self):
        sequencer_mapping = {}
        for flowcell in self.flowcells:
            sequencer_name = flowcell.sequencer.name
            pools = {x.pool for x in flowcell.fetched_lanes}
            for pool in pools:
                records = pool.fetched_libraries + pool.fetched_samples
                sequencer_mapping.update({
                    record: sequencer_name for record in records
                })

        items = sequencer_mapping.keys()

        pi_mapping = {}
        for req in self.requests:
            pi = req.user.pi
            pi_name = pi.name if pi else 'None'
            records = req.fetched_libraries + req.fetched_samples
            pi_mapping.update({
                record: pi_name for record in records if record in items
            })

        pairs = [(pi_mapping[k], v) for k, v in sequencer_mapping.items()]
        counts = Counter(pairs)

        data = {}
        for item, count in counts.items():
            if item[0] not in data:
                data[item[0]] = {}
            data[item[0]][item[1]] = count

        return OrderedDict(sorted(data.items()))

    @staticmethod
    def _get_data(counts):
        data = [{
            'name': name,
            'libraries_count': count['libraries'],
            'samples_count': count['samples'],
        } for name, count in counts.items()]

        return sorted(data, key=lambda x: x['name'])


@print_sql_queries
@login_required
@staff_member_required
def report(request):
    data = {}
    # data['end_date'] = datetime.now().strftime('%d.%m.%y')
    # request_ids = Request.objects.all().values_list('pk', flat=True)
    # samples = Sample.objects.filter(request__pk__in=request_ids)
    # libraries = Library.objects.filter(request__pk__in=request_ids)

    report = Report()

    # Start date
    # oldest_sample = samples.first()
    # oldest_library = libraries.first()
    # oldest_sample_date = oldest_sample.create_time \
    #     if oldest_sample else datetime.now()
    # oldest_library_date = oldest_library.create_time \
    #     if oldest_library else datetime.now()
    # start_date = min([oldest_sample_date, oldest_library_date])
    # data['start_date'] = start_date.strftime('%d.%m.%y')

    # Total Sample Count
    data['total_counts'] = report.get_total_counts()

    # Count by Organization
    data['organization_counts'] = report.get_organization_counts()

    # Count by Library Protocol
    data['protocol_counts'] = report.get_library_protocol_counts()

    # Count by Principal Investigator
    data['pi_counts'] = report.get_pi_counts()

    # Count by Sequencer
    data['sequencer_counts'] = report.get_sequencer_counts()

    # Count by PI and Sequencer
    data['sequencers_list'] = report.get_sequencers_list()
    data['libraries_on_sequencers_count'] = report.get_pi_sequencer_counts()

    return render(request, 'report.html', data)
