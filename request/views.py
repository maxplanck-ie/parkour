from django.http import HttpResponse
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from common.utils import get_form_errors
from request.models import Request, RequestForm
from library.models import Library, Sample

import json
from datetime import datetime
import logging

from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.rl_config import defaultPageSize

logger = logging.getLogger('db')
User = get_user_model()


def get_requests(request):
    """ Get the list of all requests and send it to frontend """
    error = str()
    data = []

    try:
        requests = Request.objects.select_related()
        data = [
            {
                'requestId': req.id,
                'status': req.status,
                'name': req.name,
                'dateCreated': req.date_created.strftime('%d.%m.%Y'),
                'description': req.description,
                'researcherId': req.researcher.id,
                'researcher': req.researcher.name,
            }
            for req in requests
        ]

    except Exception as e:
        error = str(e)
        print('[ERROR]: get_requests/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': sorted(
                data,
                key=lambda x: x['requestId'],
                reverse=True,
            )
        }),
        content_type='application/json',
    )


def save_request(request):
    """ Add new or edit an existing request """
    error = str()
    mode = request.POST.get('mode')
    
    try:
        if request.method == 'POST':
            if mode == 'add':
                form = RequestForm(request.POST)
            elif mode == 'edit':
                request_id = request.POST.get('request_id')
                req = Request.objects.get(id=request_id)
                form = RequestForm(request.POST, instance=req)

            if form.is_valid():
                if mode == 'add':
                    req = form.save(commit=False)
                    # Set initial values
                    req.status = 0
                    req.researcher = User.objects.get(id=request.user.id)
                    req.save()
                    req.name = 'Request ' + str(req.id)
                    req.save()
                else:
                    req = form.save()
                libraries = json.loads(request.POST.get('libraries'))
                samples = json.loads(request.POST.get('samples'))

                request_libraries = Library.objects.filter(id__in=libraries)
                for library in request_libraries:
                    library.is_in_request = True
                    library.save()
                req.libraries.add(*libraries)

                request_samples = Sample.objects.filter(id__in=samples)
                for sample in request_samples:
                    sample.is_in_request = True
                    sample.save()
                req.samples.add(*samples)
            
            else:
                raise Exception(get_form_errors(form.errors))
    
    except Exception as e:
        error = str(e)
        print('[ERROR]: edit_request/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )


def delete_request(request):
    error = str()

    try:
        request_id = int(request.POST.get('request_id'))
        req = Request.objects.get(id=request_id)
        libraries_samples = list(req.libraries.all()) + list(req.samples.all())
        for obj in libraries_samples:
            obj.delete()
        req.delete()

    except Exception as e:
        error = str(e)
        print('[ERROR]: delete_request/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )


def get_libraries_in_request(request):
    """ """
    error = ''
    data = []

    try:
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
        data = sorted(
            libraries + samples,
            key=lambda x: (x['recordType'], x['name']),
            reverse=True,
        )

    except Exception as e:
        error = str(e)
        print('[ERROR]: get_libraries_in_request/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data,
        }),
        content_type='application/json',
    )


def draw_string(p, x, y, string):
    _x, _y = x, y
    _y -= 30
    p.drawString(_x, _y, string[0])
    _x += 25
    p.drawString(_x, _y, string[1])
    _x += 300
    p.drawString(_x, _y, string[2])
    _x += 70
    p.drawString(_x, _y, string[3])

@csrf_exempt
def generate_pdf(request):
    """ """
    request_id = request.GET.get('request_id')

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] =\
        'inline; filename="PI_Approval_blank.pdf"'

    try:
        req = Request.objects.get(id=request_id)

        p = canvas.Canvas(response)
        PAGE_HEIGHT=defaultPageSize[1]
        PAGE_WIDTH=defaultPageSize[0]
        FONT_BOLD = 'Helvetica-Bold'
        FONT = 'Helvetica'
        HEADER_FONT_SIZE = 14
        DEFAULT_FONT_SIZE = 12
        SMALL_FONT_SIZE = 10
        x = inch
        y = 10 * inch

        # Strings
        title = 'Approval Blank'
        request_name_label = 'Request name: '
        request_name = req.name
        description_label = 'Description: '
        description = req.description
        submitted_libraries_samples = 'Submitted Libraries/Samples: '
        page_1 = 'Page 1 of 2'
        page_2 = 'Page 2 of 2'

        # Page 1
        _x = x + 100
        _y = y - 20
        p.setFont(FONT_BOLD, HEADER_FONT_SIZE)
        p.drawCentredString(PAGE_WIDTH/2.0, PAGE_HEIGHT-100, title)
        p.setFont(FONT_BOLD, DEFAULT_FONT_SIZE)
        p.drawString(x, _y, request_name_label)
        p.setFont(FONT, DEFAULT_FONT_SIZE)
        p.drawString(_x, _y, request_name)
        _y -= 15
        p.setFont(FONT_BOLD, DEFAULT_FONT_SIZE)
        p.drawString(x, _y, description_label)
        p.setFont(FONT, DEFAULT_FONT_SIZE)
        p.drawString(_x, _y, description)   # doesn't fit (if it's too long)
        p.setFont(FONT, SMALL_FONT_SIZE)
        p.drawString(x*6.5, inch, page_1)
        p.showPage()

        # Page 2
        _y = y - 20
        p.setFont(FONT_BOLD, HEADER_FONT_SIZE)
        p.drawCentredString(PAGE_WIDTH/2.0, PAGE_HEIGHT-100, title)
        p.setFont(FONT_BOLD, DEFAULT_FONT_SIZE)
        p.drawString(x, _y, submitted_libraries_samples)
        p.setFont(FONT_BOLD, SMALL_FONT_SIZE)
        draw_string(p, x, y-20, ('#', 'Name', 'Type', 'Barcode'))
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
        data = sorted(
            libraries + samples,
            key=lambda x: (x['type'], x['name']),
            reverse=True,
        )

        # Only ~55 records fit into the page
        for i, record in enumerate(data):
            draw_string(
                p,
                x,
                y - (30 + (i + 1) * 10),
                (str(i+1), record['name'], record['type'], record['barcode']),
            )

        p.drawString(x*6.5, inch, page_2)

    except:
        # TODO: Error handling
        pass

    finally:
        p.showPage()
        p.save()

    return response
