from django.shortcuts import render
from django.db.models import Q

from common.models import Organization, PrincipalInvestigator
from library_sample_shared.models import LibraryProtocol
from library.models import Library
from sample.models import Sample
from request.models import Request
from index_generator.models import Pool
from flowcell.models import Sequencer, Flowcell, Lane


def report(request):
    data = {}
    request_ids = Request.objects.all().values_list('pk', flat=True)

    # Total Sample Count
    samples = Sample.objects.filter(request__pk__in=request_ids)
    libraries = Library.objects.filter(request__pk__in=request_ids)
    data['total_counts'] = [
        {
            'type': 'samples',
            'count': samples.count(),
        },
        {
            'type': 'libraries',
            'count': libraries.count(),
        }
    ]

    # Count by Organization
    rows = [
        {
            'name': organization.name,
            'samples_count': Sample.objects.filter(
                Q(request__pk__in=request_ids) &
                Q(request__user__organization=organization)
            ).count(),
            'libraries_count': Library.objects.filter(
                Q(request__pk__in=request_ids) &
                Q(request__user__organization=organization)
            ).count(),
        }
        for organization in Organization.objects.all().order_by('name')
    ]
    data['organization_counts'] = rows

    # Count by Library Protocol
    rows = [
        {
            'name': protocol.name,
            'samples_count': Sample.objects.filter(
                Q(request__pk__in=request_ids) &
                Q(library_protocol=protocol)
            ).count(),
            'libraries_count': Library.objects.filter(
                Q(request__pk__in=request_ids) &
                Q(library_protocol=protocol)
            ).count(),
        }
        for protocol in LibraryProtocol.objects.all().order_by('name')
    ]
    data['protocol_counts'] = rows

    # Count by Principal Investigator
    rows = [
        {
            'name': pi.name,
            'samples_count': Sample.objects.filter(
                Q(request__pk__in=request_ids) &
                Q(request__user__pi=pi)
            ).count(),
            'libraries_count': Library.objects.filter(
                Q(request__pk__in=request_ids) &
                Q(request__user__pi=pi)
            ).count(),
        }
        for pi in PrincipalInvestigator.objects.all().order_by('name')
    ]
    data['pi_counts'] = rows

    # Count by Sequencer
    rows = []
    for sequencer in Sequencer.objects.all():
        samples_count = 0
        libraries_count = 0
        flowcells = Flowcell.objects.filter(sequencer=sequencer)
        lanes = Lane.objects.filter(
            pk__in=flowcells.values_list('lanes', flat=True))
        pools = Pool.objects.filter(
            pk__in=lanes.values_list('pool', flat=True).distinct())
        for pool in pools:
            samples_count += pool.samples.all().count()
            libraries_count += pool.libraries.all().count()
        rows.append({
            'name': sequencer.name,
            'libraries_count': samples_count + libraries_count,
            'runs_count': flowcells.count(),
        })
    data['sequncer_counts'] = rows

    return render(request, 'report.html', data)
