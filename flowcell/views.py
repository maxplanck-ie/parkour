from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required

from index_generator.models import Pool
from library_sample_shared.models import ReadLength
from request.models import Request
from .models import Sequencer, Lane, Flowcell
from .forms import FlowcellForm

import logging
import json

logger = logging.getLogger('db')


@login_required
@staff_member_required
def get_all(request):
    """ Get the list of all Flowcells. """
    data = []

    for flowcell in Flowcell.objects.prefetch_related('sequencer', 'lanes'):
        for lane in flowcell.lanes.select_related('pool'):
            pool = lane.pool

            libraries = pool.libraries.select_related('read_length')
            samples = pool.samples.select_related('read_length')

            if any(libraries):
                read_length_name = libraries[0].read_length.name
            else:
                read_length_name = samples[0].read_length.name

            data.append({
                'flowcellId': flowcell.flowcell_id,
                'laneName': lane.name,
                'pool': pool.id,
                'poolName': pool.name,
                'poolSize': pool.size,
                'readLengthName': read_length_name,
                'sequencer': flowcell.sequencer.pk,
                'sequencerName': flowcell.sequencer.name,
                'loadingConcentration': lane.loading_concentration
            })

        data = sorted(data, key=lambda x: (x['flowcellId'], x['laneName']))

    return JsonResponse(data, safe=False)


@login_required
@staff_member_required
def sequencer_list(request):
    """ Get the list of all sequencers. """

    data = [
        {
            'name': sequencer.name,
            'id': sequencer.id,
            'lanes': sequencer.lanes,
            'laneCapacity': sequencer.lane_capacity
        }
        for sequencer in Sequencer.objects.all()
    ]

    return JsonResponse(data, safe=False)


@login_required
@staff_member_required
def pool_list(request):
    """ Get the list of pools for loading flowcells. """
    data = []
    is_ok = False

    for pool in Pool.objects.prefetch_related('libraries', 'samples'):
        libraries = pool.libraries.all()
        samples = pool.samples.all()

        # Check if all libraries and samples have status 4
        if [l.status for l in libraries] >= [4] * pool.libraries.count() and \
                [s.status for s in samples] >= [4] * pool.samples.count():
            is_ok = True

        if is_ok and pool.size > pool.loaded:
            # Get Pool's Read Length
            if any(libraries):
                src_id = libraries[0].read_length_id
            else:
                src_id = samples[0].read_length_id
            src = ReadLength.objects.get(id=src_id)

            data.append({
                'name': pool.name,
                'id': pool.id,
                'readLength': src.id,
                'readLengthName': src.name,
                'size': pool.size - pool.loaded,
                'loaded': pool.loaded
            })

    return JsonResponse(data, safe=False)


@login_required
@staff_member_required
def pool_info(request):
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
                    'protocol': sample.library_protocol.name,
                    # 'pcrCycles': 0
                })

    return JsonResponse(data, safe=False)


@login_required
@staff_member_required
def save(request):
    """ Save a new flowcell. """
    error = ''
    lanes = json.loads(request.POST.get('lanes'))
    form = FlowcellForm(request.POST)

    if form.is_valid():
        flowcell = form.save()

        lane_objects = []
        loaded_per_pool = {}
        for lane in lanes:
            pool_id = lane['pool_id']
            loaded = lane['loaded']

            # Create a Labe object
            l = Lane(
                name=lane['name'],
                pool_id=pool_id,
                loading_concentration=lane['loading_concentration'],
            )
            l.save()
            lane_objects.append(l.pk)

            # Count Loaded for each pool on the lanes
            if pool_id not in loaded_per_pool.keys():
                loaded_per_pool[pool_id] = 0
            loaded_per_pool[pool_id] += loaded

        # Update Pool Loaded for each pool
        for pool_id, loaded in loaded_per_pool.items():
            pool = Pool.objects.get(pk=pool_id)
            pool.loaded += loaded
            pool.save(update_fields=['loaded'])

            # Change native and converted library's status to 5
            for library in pool.libraries.all():
                library.status = 5
                library.save(update_fields=['status'])

            for sample in pool.samples.all():
                sample.status = 5
                sample.save(update_fields=['status'])

        # Add lanes to the flowcell
        flowcell.lanes.add(*lane_objects)

    else:
        error = str(form.errors)
        logger.debug(form.errors.as_data())

    return JsonResponse({'success': not error, 'error': error})
