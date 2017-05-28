import json
import logging

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required

from library_sample_shared.models import ConcentrationMethod
from library.models import Library
from sample.models import Sample
from .forms import IncomingLibraryForm, IncomingSampleForm

logger = logging.getLogger('db')


@login_required
@staff_member_required
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
            error = 'Cannot update the record.'
            logger.exception(e)
        else:
            if form.is_valid():
                form.save()

                if qc_result:
                    if int(qc_result) == 1:
                        # TODO@me: use another form to make sure
                        # all Facility fields are not empty
                        record.status = 2   # passed
                        record.save(update_fields=['status'])
                    elif int(qc_result) == -2:
                        record.status = -2  # compromised
                        record.save(update_fields=['status'])
                    else:
                        record.status = -1  # failed
                        record.save(update_fields=['status'])
            else:
                error = str(form.errors)
                logger.debug(form.errors.as_data())
    else:
        error = 'Wrong HTTP method.'

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
                changed_value = item['changed_value']
                if item['record_type'] == 'L':
                    record = Library.objects.get(pk=item['record_id'])
                elif item['record_type'] == 'S':
                    record = Sample.objects.get(pk=item['record_id'])
                else:
                    raise ValueError('Record type is not L/S or missing.')

                for key, value in changed_value.items():
                    if hasattr(record, key):
                        if key == 'concentration_method_facility':
                            m = ConcentrationMethod.objects.get(pk=value)
                            setattr(record, key, m)
                        else:
                            setattr(record, key, value)
                record.save()

            except Exception as e:
                error = 'Some of the records were not updated (see the logs).'
                logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})
