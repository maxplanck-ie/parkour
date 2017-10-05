import json
import logging

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.core.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework.permissions import IsAdminUser

from request.models import Request
from library_sample_shared.models import ConcentrationMethod
from library.models import Library
from sample.models import Sample
from .forms import IncomingLibraryForm, IncomingSampleForm
from .serializers import LibrarySerializer, SampleSerializer

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
    """ Update QC Result for given libraries and samples. """
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


class IncomingLibrariesViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        """ Get the list of all incoming libraries and samples. """
        data = []
        requests_queryset = Request.objects.order_by('-create_time')
        for request_obj in requests_queryset:
            library_serializer = LibrarySerializer(
                request_obj.libraries.filter(status=1), many=True)
            sample_serializer = SampleSerializer(
                request_obj.samples.filter(status=1), many=True)
            records = sorted(library_serializer.data + sample_serializer.data,
                             key=lambda x: x['barcode'][3:])
            data += records
        return Response(data)

    @list_route(methods=['post'])
    def edit(self, request):
        """ Update multiple libraries or samples. """
        if request.is_ajax():
            post_data = request.data.get('data', [])
        else:
            post_data = json.loads(request.data.get('data', '[]'))

        if not post_data:
            return Response({
                'success': False,
                'message': 'Invalid payload.',
            }, 400)

        library_ids, sample_ids, library_post_data, sample_post_data = \
            self._separate_data(post_data)

        libraries_ok, libraries_contain_invalid = self._update_objects(
            Library, LibrarySerializer, library_ids, library_post_data)

        samples_ok, samples_contain_invalid = self._update_objects(
            Sample, SampleSerializer, sample_ids, sample_post_data)

        result = [libraries_ok, libraries_contain_invalid,
                  samples_ok, samples_contain_invalid]

        if result.count(True) == 4:
            return Response({'success': True})
        elif result.count(False) == 4:
            return Response({
                'success': False,
                'message': 'Invalid payload.',
            }, 400)
        else:
            return Response({
                'success': True,
                'message': 'Some records cannot be updated.',
            })

    def _separate_data(self, data):
        """
        Separate library and sample data, ignoring objects without
        either 'id' or 'record_type' or non-integer id.
        """
        library_ids = []
        sample_ids = []
        library_data = []
        sample_data = []

        for obj in data:
            try:
                if obj['record_type'] == 'Library':
                    library_ids.append(int(obj['pk']))
                    library_data.append(obj)
                elif obj['record_type'] == 'Sample':
                    sample_ids.append(int(obj['pk']))
                    sample_data.append(obj)
            except (KeyError, ValueError):
                continue

        return library_ids, sample_ids, library_data, sample_data

    def _update_objects(self, model_class, serializer_class, ids, data):
        """
        Update multiple objects with a given model class and a
        serializer class.
        """
        contain_invalid = False

        objects = model_class.objects.filter(pk__in=ids, status=1)
        serializer = serializer_class(data=data, instance=objects, many=True)

        if serializer.is_valid():
            serializer.save()
            objects_ok = True
        else:
            # Try to update valid objects
            valid_data = [item[1] for item in zip(serializer.errors, data)
                          if not item[0]]

            if any(valid_data):
                new_ids = [x['pk'] for x in valid_data]
                self._update_valid(
                    model_class, serializer_class, new_ids, valid_data)
                contain_invalid = True
                objects_ok = True
            else:
                objects_ok = False

        return objects_ok, contain_invalid

    def _update_valid(self, model_class, serializer_class, ids, valid_data):
        """ Update valid objects. """
        objects = model_class.objects.filter(pk__in=ids)
        serializer = serializer_class(
            data=valid_data, instance=objects, many=True)
        serializer.is_valid()
        serializer.save()
