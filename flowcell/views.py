from django.http import HttpResponse
from flowcell.models import Sequencer
from pooling.models import Pool

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

    data = [
        {
            'name': pool.name,
            'id': pool.id,
            'size': pool.size
        }
        for pool in Pool.objects.all()
    ]

    return HttpResponse(
        json.dumps(data),
        content_type='application/json',
    )
