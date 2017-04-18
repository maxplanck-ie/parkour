from django.http import JsonResponse
from library.models import Library
from sample.models import Sample
from .forms import IncomingLibraryForm, IncomingSampleForm

import logging

logger = logging.getLogger('db')


def update(request):
    """
    Update library or sample field(s). If a library/sample passes the quality
    check, then set its status to 2. Otherwise, set the status to -1 and
    notify the user about the failure via email.
    """
    error = ''

    if request.method == 'POST':
        record_type = request.POST.get('record_type', '')
        record_id = request.POST.get('record_id', '')
        qc_result = request.POST.get('qc_result', '')

        try:
            if record_type == 'L':
                record = Library.objects.get(pk=record_id)
                form = IncomingLibraryForm(request.POST, instance=record)
            elif record_type == 'S':
                record = Sample.objects.get(pk=record_id)
                form = IncomingSampleForm(request.POST, instance=record)
            else:
                raise ValueError('Record type is not L/S or missing.')
        except (ValueError, Library.DoesNotExist, Sample.DoesNotExist) as e:
            error = str(e)
            logger.exception(e)
        else:
            if form.is_valid():
                form.save()

                if qc_result:
                    if qc_result == '1':
                        # TODO@me: use another form to make sure
                        # all Facility fields are not empty
                        record.status = 2
                        record.save(update_fields=['status'])
                    else:
                        record.status = -1
                        record.save(update_fields=['status'])
                        # TODO@me: send email
            else:
                error = str(form.errors)
                logger.debug(form.errors.as_data())
    else:
        error = 'Wrong HTTP method.'

    return JsonResponse({'success': not error, 'error': error})
