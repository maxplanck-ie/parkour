from django.http import HttpResponse
from flowcell.models import Sequencer
from pooling.models import Pool
from library.models import SequencingRunCondition
from request.models import Request

import json


def get_sequencers(request):
    """ Get the list of sequencers. """
    data = []

    data = [
        {
            'name': sequencer.name,
            'id': sequencer.id,
            'lanes': sequencer.lanes,
            'laneCapacity': sequencer.lane_capacity
        }
        for sequencer in Sequencer.objects.all()
    ]

    return HttpResponse(
        json.dumps(data),
        content_type='application/json',
    )


def get_pools(request):
    """ Get the list of pools for loading flowcells. """
    data = []

    for pool in Pool.objects.prefetch_related('libraries', 'samples'):
        libraries = pool.libraries.all()
        samples = pool.samples.all()

        # Get Pool's Sequencing Run Condition (Real Length)
        if any(libraries):
            src_id = libraries[0].sequencing_run_condition_id
        else:
            src_id = samples[0].sequencing_run_condition_id
        src = SequencingRunCondition.objects.get(id=src_id)

        data.append({
            'name': pool.name,
            'id': pool.id,
            'sequencingRunCondition': src.id,
            'sequencingRunConditionName': src.name,
            'size': pool.size
        })

    return HttpResponse(
        json.dumps(data),
        content_type='application/json',
    )


def get_pool_info(request):
    """ Get additional information for a given pool. """
    data = []

    pool_id = request.GET.get('pool_id')
    pool = Pool.objects.get(id=pool_id)
    libraries = pool.libraries.all()
    samples = pool.samples.all()

    for req in Request.objects.prefetch_related('libraries', 'samples'):
        for library in req.libraries.all():
            if library in libraries:
                data.append({
                    'request': req.name,
                    'library': library.name,
                    'protocol': library.library_protocol.name,
                    # 'pcrCycles': 0
                })

        for sample in req.samples.all():
            if sample in samples:
                data.append({
                    'request': req.name,
                    'library': sample.name,
                    'protocol': sample.sample_protocol.name,
                    # 'pcrCycles': 0
                })

    return HttpResponse(
        json.dumps(data),
        content_type='application/json',
    )
