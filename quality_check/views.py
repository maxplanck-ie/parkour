from django.http import JsonResponse
from library.models import Library
from sample.models import Sample
from .forms import IncomingLibraryForm, IncomingSampleForm

import logging

logger = logging.getLogger('db')


def update(request):
    """ """
    error = ''

    if request.method == 'POST':
        record_type = request.POST.get('record_type')
        record_id = request.POST.get('record_id')

        if record_type == 'L':
            lib = Library.objects.get(pk=record_id)
            form = IncomingLibraryForm(request.POST, instance=lib)
        elif record_type == 'S':
            smpl = Sample.objects.get(pk=record_id)
            form = IncomingSampleForm(request.POST, instance=smpl)

        if form.is_valid():
            form.save()
        else:
            error = str(form.errors)
            logger.debug(form.errors.as_data())

    return JsonResponse({
        'success': not error,
        'error': error
    })
