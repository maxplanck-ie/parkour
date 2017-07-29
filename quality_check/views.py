import json
import logging

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.core.exceptions import ValidationError

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
                            try:
                                val = record._meta.get_field(key) \
                                                  .to_python(value)
                                if val is None:
                                    raise ValidationError('Wrong value.')
                            except ValidationError:
                                pass
                            else:
                                setattr(record, key, value)

                # Calculate Amount
                if 'amount_facility' not in changed_value.keys():
                    df = record.dilution_factor
                    conc_f = record.concentration_facility
                    sv_f = record.sample_volume_facility
                    if all([df, conc_f, sv_f]) and df > 0.0 and \
                            conc_f > 0.0 and sv_f > 0.0:
                        record.amount_facility = df * conc_f * sv_f

                record.save()

            except Exception as e:
                error = 'Some of the records were not updated (see the logs).'
                logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})


@login_required
@staff_member_required
def qc_update_all(request):
    """ Update QC Result for the given libraries/samples. """
    error = ''

    libraries = json.loads(request.POST.get('libraries', '[]'))
    samples = json.loads(request.POST.get('samples', '[]'))
    result = json.loads(request.POST.get('result', ''))

    try:
        qc_result = 2 if result is True else -1

        for library_id in libraries:
            library = Library.objects.get(pk=library_id)
            library.status = qc_result
            library.save(update_fields=['status'])

        for sample_id in samples:
            sample = Sample.objects.get(pk=sample_id)
            sample.status = qc_result
            sample.save(update_fields=['status'])

    except Exception as e:
        error = str(e)
        logger.exception(e)

    return JsonResponse({'success': not error, 'error': error})
