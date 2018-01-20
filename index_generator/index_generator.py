import re
import random
import itertools

from django.apps import apps


Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')


class IndexRegistry:
    # format = ''
    # mode = ''
    indices = {}

    def __init__(self, format, mode, index_types):
        for index_type in index_types:
            if index_type.pk not in self.indices.keys():
                self.indices[index_type.pk] = {'i7': [], 'i5': []}

        self.indices[index_type.pk]['i7'].extend(
            self._to_list(index_type.indices_i7.all()))

        if mode == 'dual':
            self.indices[index_type.pk]['i5'].extend(
                self._to_list(index_type.indices_i5.all()))

    def get_indices_i7(self, index_type_id):
        return self.indices[index_type_id]['i7']

    def get_indices_i5(self, index_type_id):
        return self.indices[index_type_id]['i5']

    def _to_list(self, indices):
        return list(map(lambda x: {
            'prefix': x.prefix,
            'number': x.number,
            'index': x.index,
        }, indices))


class IndexGenerator:
    index_registry = None
    libraries = None
    samples = None
    num_libraries = 0
    num_samples = 0
    index_length = ''
    format = ''
    mode = ''

    def __init__(self, library_ids=[], sample_ids=[]):
        self._result = []

        self.libraries = Library.objects.filter(
            pk__in=library_ids
        ).select_related(
            'read_length', 'index_type',
        ).prefetch_related(
            'index_type__indices_i7', 'index_type__indices_i5',
        )
        self.samples = Sample.objects.filter(
            pk__in=sample_ids
        ).select_related(
            'read_length', 'index_type',
        ).prefetch_related(
            'index_type__indices_i7', 'index_type__indices_i5',
        )

        self.num_libraries = self.libraries.count()
        self.num_samples = self.samples.count()

        if self.num_samples == 0:
            raise ValueError('No samples provided.')

        records = list(itertools.chain(self.libraries, self.samples))
        read_lengths = [x.read_length.pk for x in records]
        if len(set(read_lengths)) != 1:
            raise ValueError(
                'Read Length must be the same for all libraries and samples.')

        index_types = self.validate_index_types(records)
        self.index_registry = IndexRegistry(
            self.format, self.mode, index_types)

    def validate_index_types(self, records):
        """ Check the compatibility of the provided samples. """
        index_types = [x.index_type for x in records]
        index_types = list(filter(None, index_types))

        if len(index_types) != len(records):
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

        return index_types

    def generate(self):
        if self.num_libraries > 0:
            # TODO: Add all libraries directly to the result

            # TODO: Find indices for all samples
            # for i, sample in enumerate(self.samples):
            #     self.find_indices(sample, i)

            pass

        elif self.num_samples == 1:
            self.find_random_indices(self.samples[0])

        else:
            # TODO: Find best pair
            # self.find_best_pair()

            # TODO: Find indices for the remaining samples
            # for i, sample in enumerate(self.samples[2:]):
            #     self.find_indices(sample, i)

            pass

        return self.result

    def find_indices(self):
        pass

    def find_best_pair(self):
        pass

    def find_random_indices(self, sample):
        """ Find random indices I7/I5 for a given sample. """
        # TODO: deal with I7-I5 pairs

        index_i7 = random.choice(
            self.index_registry.get_indices_i7(sample.index_type.pk))
        index_i5 = self.create_index_dict()

        if self.mode == 'dual':
            # Ensure I7/I5 uniqueness
            indices_i5 = [x for x in self.index_registry.get_indices_i5(
                sample.index_type.pk) if x['index'] != index_i7['index']]

            if any(indices_i5):
                index_i5 = random.choice(indices_i5)
            else:
                raise ValueError(
                    f'Failed to generate Index I5 for {sample.name}')

        self._result.append(
            self.create_result_dict(sample, index_i7, index_i5))

    @property
    def result(self):
        """ Construct a list of all records and their indices. """
        result = []

        for record in self._result:
            index_i7 = record['index_i7']
            index_i5 = record['index_i5']
            rec = dict(record)

            rec['index_i7_id'] = index_i7['prefix'] + index_i7['number']
            rec['index_i5_id'] = index_i5['prefix'] + index_i5['number']

            for i in range(len(index_i7['index'])):
                rec[f'index_i7_{i + 1}'] = index_i7['index'][i]

            for i in range(len(index_i5['index'])):
                rec[f'index_i5_{i + 1}'] = index_i5['index'][i]

            result.append(rec)

        result = sorted(result, key=lambda x: (
            x['index_i7']['prefix'], int(x['index_i7']['number'])
        ))

        return result

    @staticmethod
    def convert_index(index):
        """ Convert A/C into R (red) and T into G (green). """
        return re.sub('T', 'G', re.sub('A|C', 'R', index))

    @staticmethod
    def create_index_dict(prefix='', number='', index=''):
        return {'prefix': prefix, 'number': number, 'index': index}

    @staticmethod
    def create_result_dict(obj, index_i7, index_i5):
        return {
            'pk': obj.pk,
            'name': obj.name,
            # 'barcode': obj.barcode,
            'record_type': obj.__class__.__name__,
            'read_length': obj.read_length_id,
            'sequencing_depth': obj.sequencing_depth,
            # 'index_type': obj.index_type.pk,
            'index_i7': index_i7,
            'index_i5': index_i5,
        }
