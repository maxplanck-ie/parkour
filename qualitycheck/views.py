from django.http import HttpResponse
from library.models import Library, Sample
from qualitycheck.models import IncomingLibraryForm, IncomingSampleForm

import logging
import json

logger = logging.getLogger('db')


def qc_incoming_libraries(request):
    """ """
    error = ''

    if request.method == 'POST':
        record_type = request.POST.get('record_type')
        record_id = request.POST.get('record_id')

        try:
            if record_type == 'L':
                lib = Library.objects.get(id=record_id)
                form = IncomingLibraryForm(request.POST, instance=lib)
            elif record_type == 'S':
                smpl = Sample.objects.get(id=record_id)
                form = IncomingLibraryForm(request.POST, instance=smpl)

            if form.is_valid():
                form.save()
            else:
                error = 'Form is invalid'
                print('[ERROR]: qc_incoming_libraries/: %s' % 
                    form.errors.as_data()
                )
                logger.debug(form.errors.as_data())

        except Exception as e:
            error = str(e)
            print('[ERROR]: %s' % error)
            logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )
