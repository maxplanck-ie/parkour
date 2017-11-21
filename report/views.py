from datetime import datetime
from collections import OrderedDict

from django.shortcuts import render
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required

from common.models import Organization, PrincipalInvestigator
from library_sample_shared.models import LibraryProtocol
from library.models import Library
from sample.models import Sample
from request.models import Request
from index_generator.models import Pool
from flowcell.models import Sequencer, Flowcell, Lane


@login_required
@staff_member_required
def report(request):
    data = {}
    data['end_date'] = datetime.now().strftime('%d.%m.%y')
    request_ids = Request.objects.all().values_list('pk', flat=True)
    samples = Sample.objects.filter(request__pk__in=request_ids)
    libraries = Library.objects.filter(request__pk__in=request_ids)

    # Start date
    oldest_sample = samples.first()
    oldest_library = libraries.first()
    oldest_sample_date = oldest_sample.create_time \
        if oldest_sample else datetime.now()
    oldest_library_date = oldest_library.create_time \
        if oldest_library else datetime.now()
    start_date = min([oldest_sample_date, oldest_library_date])
    data['start_date'] = start_date.strftime('%d.%m.%y')

    # Total Sample Count
    data['total_counts'] = get_total_counts(libraries, samples)

    # Count by Organization
    data['organization_counts'] = get_organization_counts(request_ids)

    # Count by Library Protocol
    data['protocol_counts'] = get_library_protocol_counts(request_ids)

    principal_investigators = PrincipalInvestigator.objects.order_by(
        'organization__name', 'name'
    )

    # Count by Principal Investigator
    data['pi_counts'] = get_pi_counts(request_ids, principal_investigators)

    sequencers = Sequencer.objects.all().order_by('name')

    # Count by Sequencer
    data['sequencer_counts'] = get_sequencer_counts(sequencers)

    # Count by PI and Sequencer
    data['sequencers_list'] = sequencers.values_list('name', flat=True)
    data['libraries_on_sequencers_count'] = get_pi_sequencer_counts(
        principal_investigators, sequencers,
    )

    return render(request, 'report.html', data)


def get_total_counts(libraries, samples):
    return [
        {
            'type': 'Samples',
            'count': samples.count(),
        },
        {
            'type': 'Libraries',
            'count': libraries.count(),
        }
    ]


def get_organization_counts(request_ids):
    return [
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


def get_library_protocol_counts(request_ids):
    return [
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


def get_pi_counts(request_ids, principal_investigators):
    return [
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
        for pi in principal_investigators
    ]


def get_sequencer_counts(sequencers):
    rows = []
    for sequencer in sequencers:
        flowcells = Flowcell.objects.filter(sequencer=sequencer)
        lanes = Lane.objects.filter(
            pk__in=flowcells.values_list('lanes', flat=True))
        pools = Pool.objects.filter(
            pk__in=lanes.values_list('pool', flat=True).distinct())
        samples_count = Sample.objects.filter(pool__in=pools).count()
        libraries_count = Library.objects.filter(pool__in=pools).count()
        rows.append({
            'name': sequencer.name,
            'libraries_count': samples_count + libraries_count,
            'runs_count': flowcells.count(),
        })
    return rows


def get_pi_sequencer_counts(principal_investigators, sequencers):
    rows = []
    for pi in principal_investigators:
        row = OrderedDict({'pi': pi.name})
        for sequencer in sequencers:
            flowcells = Flowcell.objects.filter(sequencer=sequencer)
            lanes = Lane.objects.filter(
                pk__in=flowcells.values_list('lanes', flat=True))
            pools = Pool.objects.filter(
                pk__in=lanes.values_list('pool', flat=True).distinct())
            samples_count = Sample.objects.filter(
                pool__in=pools, request__user__pi=pi,
            ).count()
            libraries_count = Library.objects.filter(
                pool__in=pools, request__user__pi=pi,
            ).count()
            row[sequencer.name] = samples_count + libraries_count
        rows.append(row)
    return rows
