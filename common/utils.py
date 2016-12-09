from django.http import JsonResponse

from datetime import datetime
from time import time


class JSONResponseMixin:
    """
    A mixin that can be used to render a JSON response.
    """

    def render_to_json_response(self, context, **response_kwargs):
        return JsonResponse(
            self.get_data(context),
            **response_kwargs
        )

    def get_data(self, context):
        return context


def timeit(func):
    def wrapper(*args):
        start = time()
        result = func(*args)
        end = time()
        print('{0}(): Execution time: {1:2f} s'.format(
            func.__name__, end - start)
        )
        return result
    return wrapper


def get_form_errors(errors):
    result = 'Form is invalid:<br/><br/>'
    for error_field, error_message in errors.items():
        result += 'Field "%s":<br/>%s' % (error_field, error_message)
    return result


def generate_barcode(record_type, counter):
    barcode = datetime.now().strftime('%y') + record_type
    barcode += '0' * (6 - len(counter)) + counter
    return barcode
