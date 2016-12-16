from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

from index_generator.models import Pool
from library_sample_shared.models import ReadLength
from request.models import Request
from .models import Sequencer


@login_required
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
def pool_list(request):
    """ Get the list of pools for loading flowcells. """
    data = []

    for pool in Pool.objects.prefetch_related('libraries', 'samples'):
        if pool.size > pool.loaded:
            libraries = pool.libraries.all()
            samples = pool.samples.all()

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
                    'protocol': sample.sample_protocol.name,
                    # 'pcrCycles': 0
                })

    return JsonResponse(data, safe=False)
