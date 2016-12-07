from django.http import HttpResponse
from flowcell.models import Sequencer
from pooling.models import Pool
from library.models import SequencingRunCondition

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

        # ff
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
