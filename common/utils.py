import re
import string
import random
from time import time
from datetime import datetime

from django.db import connection


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


def generate_barcode(record_type, counter):
    barcode = datetime.now().strftime('%y') + record_type
    barcode += '0' * (6 - len(counter)) + counter
    return barcode


def get_random_name(len=10):
    """ Generate a random string of a given length. """
    return ''.join(random.SystemRandom().choice(
        string.ascii_lowercase + string.digits
    ) for _ in range(len))


def print_sql_queries(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        finally:
            for i, query in enumerate(connection.queries):
                sql = re.split(
                    r'(SELECT|FROM|WHERE|GROUP BY|ORDER BY|INNER JOIN|LIMIT)',
                    query['sql']
                )
                if not sql[0]:
                    sql = sql[1:]
                sql = [(' ' if i % 2 else '') + x for i, x in enumerate(sql)]
                print('\n### {} ({} seconds)\n\n{};\n'.format(
                    i, query['time'], '\n'.join(sql)))
    return wrapper
