from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import Request
from .forms import RequestForm

import json
from datetime import datetime
import logging

from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.rl_config import defaultPageSize

User = get_user_model()
logger = logging.getLogger('db')


@login_required
def get_all(request):
    """
    GET /request/get_all/
        Get the list of all requests.

    :returns:   list with requests
    :rtype:     JSON response
    """

    if request.user.is_staff:
        requests = Request.objects.prefetch_related(
            'user', 'libraries', 'samples'
        )
    else:
        requests = Request.objects.filter(
            user_id=request.user.id
        ).prefetch_related('user', 'libraries', 'samples')

    # TODO@me: define Request status
    data = [
        {
            'requestId': req.id,
            'status': 0,
            'name': req.name,
            'dateCreated': req.date_created.strftime('%d.%m.%Y'),
            'description': req.description,
            'researcherId': req.user.id,
            'researcher': req.user.name,
            'deepSeqRequestName':
                req.deep_seq_request.name.split('/')[-1]
                if req.deep_seq_request else '',
            'deepSeqRequestPath':
                settings.MEDIA_URL + req.deep_seq_request.name
                if req.deep_seq_request else '',
            'sumSeqDepth': sum([
                l.sequencing_depth
                for l in list(req.libraries.all()) + list(req.samples.all())
            ])
        }
        for req in sorted(requests, key=lambda x: x.date_created, reverse=True)
    ]

    return JsonResponse(data, safe=False)


@login_required
def get_libraries_and_samples(request):
    """
    GET /request/libraries_and_samples/?request_id={request_id}
        Get the list of all libraries and samples for a given request.

    :param request_id:  request id

    :returns:   libraries and samples in a given request
    :rtype:     JSON reponse
    """

    request_id = request.GET.get('request_id')
    req = Request.objects.get(id=request_id)

    libraries = [
        {
            'name': library.name,
            'recordType': 'L',
            'libraryId': library.id,
            'barcode': library.barcode,
        }
        for library in req.libraries.all()
    ]

    samples = [
        {
            'name': sample.name,
            'recordType': 'S',
            'sampleId': sample.id,
            'barcode': sample.barcode,
        }
        for sample in req.samples.all()
    ]

    data = sorted(libraries + samples, key=lambda x: x['barcode'])

    return JsonResponse({'success': True, 'data': data})


@login_required
def save_request(request):
    """
    POST /request/save_request/
        Add new or edit an existing request.

    :param mode:  add/edit - controles the mode: either add or edit a request
    :param request_id: request id if mode='edit'; otherwise, ''
    :param libraries: list of library ids
    :param samples: list of samples ids
    :param description: request description

    :returns:   {'success': not error, 'error': error}
    :rtype:     JSON response
    """
    error = str()
    form = None

    mode = request.POST.get('mode')
    request_id = request.POST.get('request_id')

    if mode == 'add':
        form = RequestForm(request.POST)
    else:
        try:
            req = Request.objects.get(id=request_id)
            form = RequestForm(request.POST, instance=req)
        except (ValueError, Request.DoesNotExist) as e:
            error = str(e)
            logger.exception(e)

    if form:
        if form.is_valid():
            if mode == 'add':
                req = form.save(commit=False)
                req.user = User.objects.get(pk=request.user.id)
                req.save()
            else:
                req = form.save()

            library_ids = request.POST.get('libraries')
            sample_ids = request.POST.get('samples')

            if library_ids:
                libraries = json.loads(library_ids)
                req.libraries.add(*libraries)

            if sample_ids:
                samples = json.loads(sample_ids)
                req.samples.add(*samples)

            if not library_ids and not sample_ids:
                error = 'Please provide Libraries and/or samples.'
        else:
            error = str(form.errors)
            logger.debug(form.errors)

    return JsonResponse({'success': not error, 'error': error})


@login_required
def delete_request(request):
    """
    POST /request/delete_request/
        Delete request with a given id and all its libraries and samples.

    :param request_id:  request id

    :returns:   {'success': not error, 'error': error}
    :rtype:     JSON response
    """
    error = ''
    request_id = request.POST.get('request_id')

    try:
        req = Request.objects.get(pk=request_id)
        req.delete()
    except (ValueError, Request.DoesNotExist) as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@csrf_exempt
@login_required
def generate_deep_sequencing_request(request):
    """ """
    request_id = request.GET.get('request_id')
    response = HttpResponse(content_type='application/pdf')

    # Helper functions
    def _draw_page_header(p, font, font_size):
        """ """
        page_width = defaultPageSize[0]
        page_height = defaultPageSize[1]
        title = 'Deep Sequencing Request'
        p.setFont(font, font_size)
        p.drawCentredString(page_width / 2.0, page_height - 75, title)

    def __draw_string(p, x, _x, y, font, font_bold, font_size, label, string):
        """ """
        p.setFont(font_bold, font_size)
        p.drawString(x, y, label)
        p.setFont(font, font_size)
        p.drawString(_x, y, string)

    def _draw_table_row(p, x, y, string):
        """ """
        _x, _y = x, y
        _y -= 30
        p.drawString(_x, _y, string[0])
        _x += 25
        p.drawString(_x, _y, string[1])
        _x += 300
        p.drawString(_x, _y, string[2])
        _x += 70
        p.drawString(_x, _y, string[3])

    try:
        req = Request.objects.get(id=request_id)
        user = User.objects.get(id=req.researcher_id)
        cost_unit = sorted([u.name for u in user.cost_unit.all()])
        filename = req.name + '_Deep_Sequencing_Request.pdf'
        response['Content-Disposition'] = 'inline; filename="%s"' % filename

        p = canvas.Canvas(response)
        FONT_BOLD = 'Helvetica-Bold'
        FONT = 'Helvetica'
        HEADER_FONT_SIZE = 14
        DEFAULT_FONT_SIZE = 12
        SMALL_FONT_SIZE = 10
        LINE_SPACING = 20

        x = inch
        y = 10 * inch + 25

        # Strings
        request_name = req.name
        description = req.description
        submitted_libraries_samples = 'List of samples/libraries to be ' + \
            'submitted for sequencing:'
        page_1 = 'Page 1 of 2'
        page_2 = 'Page 2 of 2'

        # Page 1
        _x = x + 150
        _y = y - 10
        __draw_page_header(p, FONT_BOLD, HEADER_FONT_SIZE)

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'Request Name:', request_name,
        )
        _y -= LINE_SPACING

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'Date:', datetime.now().strftime('%d.%m.%Y'),
        )
        _y -= LINE_SPACING

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'Request Number:', '',
        )
        _y -= LINE_SPACING

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'Provider:', '',
        )
        _y -= LINE_SPACING * 1.5

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'User:', user.name,
        )
        _y -= LINE_SPACING

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'Phone:', user.phone,
        )
        _y -= LINE_SPACING

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'Email:', user.email
        )
        _y -= LINE_SPACING

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'Organization:', user.organization.name,
        )
        _y -= LINE_SPACING

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'Principal Investigator:',
            user.pi.name if user.pi is not None else '',
        )
        _y -= LINE_SPACING

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'Cost Unit(s):',
            ', '.join(cost_unit) if any(cost_unit) else '',
        )
        _y -= LINE_SPACING * 1.5

        _draw_string(
            p, x, _x, _y, FONT, FONT_BOLD, DEFAULT_FONT_SIZE,
            'Description:', description,
        )
        _y -= LINE_SPACING

        # Signature
        signature_y = 1.5 * inch
        p.setFont(FONT, SMALL_FONT_SIZE - 1)
        p.line(x, signature_y + 10, x + 125, signature_y + 10)
        p.drawString(x + 30, signature_y, '(Date, Signature)')
        p.line(x + 150, signature_y + 10, x + 300, signature_y + 10)
        p.drawString(x + 180, signature_y, '(Principal Investigator)')

        p.setFont(FONT, SMALL_FONT_SIZE)
        p.drawString(x * 6.5, inch, page_1)   # Page counter
        p.showPage()

        # Page 2
        _y = y - 10
        _draw_page_header(p, FONT_BOLD, HEADER_FONT_SIZE)
        p.setFont(FONT_BOLD, DEFAULT_FONT_SIZE)
        p.drawString(x, _y, submitted_libraries_samples)
        p.setFont(FONT_BOLD, SMALL_FONT_SIZE)
        _draw_table_row(p, x, y - 10, ('#', 'Name', 'Type', 'Barcode'))
        p.setFont(FONT, SMALL_FONT_SIZE)

        libraries = [
            {
                'name': library.name,
                'type': 'Library',
                'barcode': library.barcode,
            }
            for library in req.libraries.all()
        ]
        samples = [
            {
                'name': sample.name,
                'type': 'Sample',
                'barcode': sample.barcode,
            }
            for sample in req.samples.all()
        ]
        data = sorted(libraries + samples, key=lambda x: x['barcode'])

        # Only ~55 records fit into the page
        for i, record in enumerate(data):
            _draw_table_row(
                p,
                x,
                y - (15 + (i + 1) * 10),
                (str(i + 1), record['name'], record['type'], record['barcode']),
            )

        p.drawString(x * 6.5, inch, page_2)   # Page counter
        p.showPage()
        p.save()

    except:
        # TODO@me: Error handling
        pass

    return response


@csrf_exempt
@login_required
def upload_deep_sequencing_request(request):
    """
    Upload Deep Sequencing request with PI's signature and
    change request status to 1.
    """
    error = ''
    file_name = ''
    file_path = ''

    request_id = request.POST.get('request_id')

    if any(request.FILES):
        try:
            req = Request.objects.get(pk=request_id)
            req.deep_seq_request = request.FILES.get('file')
            req.save()

            file_name = req.deep_seq_request.name.split('/')[-1]
            file_path = settings.MEDIA_URL + req.deep_seq_request.name

            libraries = req.libraries.all()
            samples = req.samples.all()

            # Set statuses to 1
            for library in libraries:
                library.status = 1
                library.save(update_fields=['status'])

            for sample in samples:
                sample.status = 1
                sample.save(update_fields=['status'])

        except (ValueError, Request.DoesNotExist) as e:
            error = str(e)
            logger.exception(e)
    else:
        error = 'File is missing.'

    return JsonResponse({
        'success': not error,
        'error': error,
        'name': file_name,
        'path': file_path
    })
