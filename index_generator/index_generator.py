import re
import itertools

from django.apps import apps


Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')


class IndexRegistry:
    pass


class IndexGenerator:
    result = []
    libraries = None
    samples = None
    num_libraries = 0
    num_samples = 0
    index_length = ''
    format = ''
    mode = ''

    def __init__(self, library_ids=[], sample_ids=[]):
        self.libraries = Library.objects.filter(
            pk__in=library_ids).select_related('index_type')
        self.samples = Sample.objects.filter(
            pk__in=sample_ids).select_related('index_type')

        self.num_libraries = self.libraries.count()
        self.num_samples = self.samples.count()

        if self.num_samples == 0:
            raise ValueError('No samples provided.')

        records = list(itertools.chain(self.libraries, self.samples))
        index_types = [x.index_type for x in records]
        index_types = list(filter(None, index_types))

        if len(index_types) != self.num_libraries + self.num_samples:
            raise ValueError(
                'Index Type must be set for all libraries and samples.')
        index_types = list(set(index_types))

        is_dual = [x.is_dual for x in index_types]
        if len(set(is_dual)) != 1:
            raise ValueError('Mixed single/dual indices are not allowed.')
        self.mode = 'dual' if is_dual[0] else 'single'

        index_lengths = [x.index_length for x in index_types]
        if len(set(index_lengths)) != 1:
            raise ValueError('Index Types with mixed index lengths ' +
                             'are not allowed.')
        self.index_length = index_lengths[0]

        formats = [x.format for x in index_types]
        if len(set(formats)) != 1:
            raise ValueError('Index Types with mixed formats are not allowed.')
        self.format = formats[0]

    def generate(self):
        if self.num_libraries > 0:
            # TODO: Add all libraries directly to the result
            pass

        elif self.num_samples == 1:
            # TODO: Find a random index
            pass

        else:
            # TODO: Find best pair

            # TODO: Find indices for remaining samples

            pass

        return self.get_result()

    def get_result(self):
        result = []
        return result

    @staticmethod
    def convert_index(index):
        """ Convert A/C into R (red) and T into G (green). """
        return re.sub('T', 'G', re.sub('A|C', 'R', index))
