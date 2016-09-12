from time import time


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


def get_simple_field_dict(data):
    return [{'id': obj.id, 'name': obj.name} for obj in data]


def get_form_errors(errors):
    result = 'Form is invalid:<br/><br/>'
    for error_field, error_message in errors.items():
        result += 'Field "%s":<br/>%s' % (error_field, error_message)
    return result
