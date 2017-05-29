import logging
import json
import csv
import unicodedata

from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from xlwt import Workbook, XFStyle

from index_generator.models import Pool
from library_sample_shared.models import ReadLength, IndexI7, IndexI5
from request.models import Request
from .models import Sequencer, Lane, Flowcell
from .forms import FlowcellForm, LaneForm

logger = logging.getLogger('db')


def indices_present(libraries, samples):
    count_total = libraries.count() + samples.count()
    index_i7_count = 0
    index_i5_count = 0
    equal_representation_count = 0

    for library in libraries:
        if library.index_i7 != '':
            index_i7_count += 1
        if library.index_i5 != '':
            index_i5_count += 1
        if library.equal_representation_nucleotides:
            equal_representation_count += 1

    for sample in samples:
        if sample.index_i7 != '':
            index_i7_count += 1
        if sample.index_i5 != '':
            index_i5_count += 1
        if sample.equal_representation_nucleotides:
            equal_representation_count += 1

    # If at least one Index I7/I5 is set
    index_i7_show = 'Yes' if index_i7_count > 0 else 'No'
    index_i5_show = 'Yes' if index_i5_count > 0 else 'No'

    # If all Equal Representation are set
    equal_representation = 'Yes' \
        if equal_representation_count == count_total else 'No'

    return index_i7_show, index_i5_show, equal_representation


@login_required
@staff_member_required
def get_all(request):
    """ Get the list of all Flowcells. """
    data = []

    try:
        for flowcell in Flowcell.objects.prefetch_related('lanes'):
            for lane in flowcell.lanes.filter(completed=False):
                pool = lane.pool

                libraries = pool.libraries.select_related('read_length')
                samples = pool.samples.select_related('read_length')
                index_i7_show, index_i5_show, equal_representation = \
                    indices_present(libraries, samples)

                if libraries.count() == 0 and samples.count() == 0:
                    logger.debug('No libraries and samples in %s' % pool.name)
                    continue

                read_length_name = samples[0].read_length.name \
                    if any(samples) else libraries[0].read_length.name

                data.append({
                    'flowcellId': flowcell.flowcell_id,
                    'flowcell': flowcell.pk,
                    'laneId': lane.pk,
                    'laneName': lane.name,
                    'pool': pool.pk,
                    'poolName': pool.name,
                    'readLengthName': read_length_name,
                    'indexI7Show': index_i7_show,
                    'indexI5Show': index_i5_show,
                    'sequencer': flowcell.sequencer.pk,
                    'sequencerName': flowcell.sequencer.name,
                    'equalRepresentation': equal_representation,
                    'loading_concentration': lane.loading_concentration,
                    'phix': lane.phix,
                })

    except Exception as e:
        logger.exception(e)

    data = sorted(data, key=lambda x: (x['flowcellId'], x['laneName']))

    return JsonResponse(data, safe=False)


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

        if is_ok and pool.size.multiplier > pool.loaded:
            # Get Read Length
            read_length_id = libraries[0].read_length_id if any(libraries) \
                else samples[0].read_length_id
            read_length = ReadLength.objects.get(pk=read_length_id)

            data.append({
                'name': pool.name,
                'id': pool.pk,
                'readLength': read_length.pk,
                'readLengthName': read_length.name,
                'poolSizeId': pool.size.pk,
                'size': pool.size.multiplier,
                'loaded': pool.loaded,
            })

    data = sorted(data, key=lambda x: x['id'])

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
                    'barcode': library.barcode,
                    'protocol': library.library_protocol.name,
                })

        for sample in req.samples.all():
            if sample in samples:
                data.append({
                    'request': req.name,
                    'library': sample.name,
                    'barcode': sample.barcode,
                    'protocol': sample.library_protocol.name,
                })

    data = sorted(data, key=lambda x: x['barcode'][3:])

    return JsonResponse(data, safe=False)


@login_required
@staff_member_required
def save(request):
    """ Save a new flowcell. """
    error = ''
    lanes = json.loads(request.POST.get('lanes', '[]'))

    try:
        if not any(lanes):
            raise ValueError('No lanes are provided.')

        form = FlowcellForm(request.POST)

        if form.is_valid():
            flowcell = form.save()

            lane_objects = []
            loaded_per_pool = {}
            for lane in lanes:
                pool_id = lane['pool_id']

                # Create a Labe object
                l = Lane(name=lane['name'], pool_id=pool_id)
                l.save()
                lane_objects.append(l.pk)

                # Count Loaded for each pool on the lanes
                if pool_id not in loaded_per_pool.keys():
                    loaded_per_pool[pool_id] = 0
                loaded_per_pool[pool_id] += 1

            # Update Pool Loaded for each pool
            for pool_id, loaded in loaded_per_pool.items():
                pool = Pool.objects.get(pk=pool_id)
                pool.loaded = loaded
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

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@login_required
@staff_member_required
def update(request):
    """ Edit a flowcell. """
    error = ''
    lane_id = request.POST.get('lane_id', '')
    qc_result = json.loads(request.POST.get('qc_result', 'false'))

    try:
        lane = Lane.objects.get(pk=lane_id)
        form = LaneForm(request.POST, instance=lane)

        if form.is_valid():
            lane = form.save()

            if qc_result:
                lane.completed = True
                lane.save(update_fields=['completed'])

                pool = lane.pool
                for library in pool.libraries.all():
                    library.status = 6
                    library.save(update_fields=['status'])

                for sample in pool.samples.all():
                    sample.status = 6
                    sample.save(update_fields=['status'])
        else:
            error = str(form.errors)
            logger.debug(form.errors)

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@login_required
@staff_member_required
def update_all(request):
    """ Update a field in all records (apply to all). """
    error = ''

    if request.is_ajax():
        data = json.loads(request.body.decode('utf-8'))
        for item in data:
            try:
                lane_id = item['lane_id']
                lane = Lane.objects.get(pk=lane_id)
                changed_value = item['changed_value']
                for key, value in changed_value.items():
                    if hasattr(lane, key):
                        setattr(lane, key, value)
                lane.save()

            except Exception as e:
                error = 'Some of the libraries were not updated ' + \
                    '(see the logs).'
                logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@csrf_exempt
@login_required
@staff_member_required
def download_benchtop_protocol(request):
    """ Generate Benchtop Protocol as XLS file for selected lanes. """
    response = HttpResponse(content_type='application/ms-excel')
    lanes = json.loads(request.POST.get('lanes', '{}'))

    filename = 'FC_Loading_Benchtop_Protocol.xls'
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename

    wb = Workbook(encoding='utf-8')
    ws = wb.add_sheet('FC_Loading_Benchtop_Protocol')

    try:
        if not any(lanes):
            raise ValueError('No lanes are selected.')

        header = ['Pool ID', 'Flowcell ID', 'Sequencer', 'Lane', 'I7 present',
                  'I5 present', 'Equal Representation of Nucleotides',
                  'Read Length', 'Loading Concentration', 'PhiX %']
        row_num = 0

        font_style = XFStyle()
        font_style.font.bold = True

        for i, column in enumerate(header):
            ws.write(row_num, i, column, font_style)
            ws.col(i).width = 7000  # Set column width

        font_style = XFStyle()
        font_style.alignment.wrap = 1

        for lane_id, flowcell_id in lanes.items():
            lane = Lane.objects.get(pk=lane_id)
            pool = lane.pool
            flowcell = Flowcell.objects.get(pk=flowcell_id)
            row_num += 1

            libraries = pool.libraries.select_related('read_length')
            samples = pool.samples.select_related('read_length')
            index_i7_show, index_i5_show, equal_representation = \
                indices_present(libraries, samples)
            read_length_name = samples[0].read_length.name if any(samples) \
                else libraries[0].read_length.name

            row = [
                lane.pool.name, flowcell.flowcell_id, flowcell.sequencer.name,
                lane.name, index_i7_show, index_i5_show, equal_representation,
                read_length_name, lane.loading_concentration, lane.phix
            ]

            for i in range(len(row)):
                ws.write(row_num, i, row[i], font_style)

    except Exception as e:
        logger.exception(e)

    wb.save(response)

    return response


@csrf_exempt
@login_required
@staff_member_required
def download_sample_sheet(request):
    """ Generate Benchtop Protocol as XLS file for selected lanes. """
    response = HttpResponse(content_type='text/csv')
    lanes = json.loads(request.POST.get('lanes', '[]'))
    flowcell_id = json.loads(request.POST.get('flowcell_id', ''))

    writer = csv.writer(response)
    writer.writerow(['[Header]', '', '', '', '', '', '', '', '', '', ''])
    writer.writerow(['IEMFileVersion', '4', '', '', '', '', '', '', '', '',
                     ''])
    writer.writerow(['Date', '11/3/2016', '', '', '', '', '', '', '', '', ''])
    writer.writerow(['Workflow', 'GenerateFASTQ', '', '', '', '', '', '', '',
                     '', ''])
    writer.writerow(['Application', 'HiSeq FASTQ Only', '', '', '', '', '', '',
                     '', '', ''])
    writer.writerow(['Assay', 'Nextera XT', '', '', '', '', '', '', '', '',
                     ''])
    writer.writerow(['Description', '', '', '', '', '', '', '', '', '', ''])
    writer.writerow(['Chemistry', 'Amplicon', '', '', '', '', '', '', '', '',
                     ''])
    writer.writerow(['', '', '', '', '', '', '', '', '', '', ''])
    writer.writerow(['[Reads]', '', '', '', '', '', '', '', '', '', ''])
    writer.writerow(['75', '', '', '', '', '', '', '', '', '', ''])
    writer.writerow(['75', '', '', '', '', '', '', '', '', '', ''])
    writer.writerow(['', '', '', '', '', '', '', '', '', '', ''])
    writer.writerow(['[Settings]', '', '', '', '', '', '', '', '', '', ''])
    writer.writerow(['ReverseComplement', '0', '', '', '', '', '', '', '', '',
                     ''])
    writer.writerow(['Adapter', 'CTGTCTCTTATACACATCT', '', '', '', '', '', '',
                     '', '', ''])
    writer.writerow(['', '', '', '', '', '', '', '', '', '', ''])
    writer.writerow(['[Data]', '', '', '', '', '', '', '', '', '', ''])

    writer.writerow(['Lane', 'Sample_ID', 'Sample_Name', 'Sample_Plate',
                     'Sample_Well', 'I7_Index_ID', 'index', 'I5_Index_ID',
                     'index2', 'Sample_Project', 'Description'])

    def create_row(lane, record):
        index_i7 = IndexI7.objects.filter(
            index=record.index_i7,
            index_type=record.index_type
        )
        index_i7_id = index_i7[0].index_id if index_i7 else ''

        index_i5 = IndexI5.objects.filter(
            index=record.index_i5,
            index_type=record.index_type
        )
        index_i5_id = index_i5[0].index_id if index_i5 else ''

        request_name = unicodedata.normalize('NFKD', record.request.get().name)
        request_name = str(request_name.encode('ASCII', 'ignore'), 'utf-8')

        library_protocol = \
            unicodedata.normalize('NFKD', record.library_protocol.name)
        library_protocol = str(library_protocol.encode('ASCII', 'ignore'),
                               'utf-8')
        return [
            lane.name.split()[1],  # Lane
            record.barcode,        # Sample_ID
            record.name,           # Sample_Name
            '',                    # Sample_Plate
            '',                    # Sample_Well
            index_i7_id,           # I7_Index_ID
            record.index_i7,       # index
            index_i5_id,           # I5_Index_ID
            record.index_i5,       # index2
            request_name,          # Sample_Project / Request ID
            library_protocol,      # Description / Library Protocol
        ]

    flowcell = Flowcell.objects.get(pk=flowcell_id)
    filename = '%s_SampleSheet.csv' % flowcell.flowcell_id
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename

    if not any(lanes):
        raise ValueError('No lanes are selected.')

    rows = []
    for lane_id in lanes:
        lane = Lane.objects.get(pk=lane_id)
        pool = lane.pool
        libraries = pool.libraries.all()
        samples = pool.samples.all()

        for library in libraries:
            row = create_row(lane, library)
            rows.append(row)

        for sample in samples:
            row = create_row(lane, sample)
            rows.append(row)

    rows = sorted(rows, key=lambda x: (x[0], x[1][3:]))
    for row in rows:
        writer.writerow(row)

    return response
