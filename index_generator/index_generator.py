import re
import random
import itertools
from collections import namedtuple

from django.apps import apps

IndexI7 = apps.get_model('library_sample_shared', 'IndexI7')
IndexI5 = apps.get_model('library_sample_shared', 'IndexI5')
IndexPair = apps.get_model('library_sample_shared', 'IndexPair')
Library = apps.get_model('library', 'Library')
Sample = apps.get_model('sample', 'Sample')


class IndexRegistry:
    def __init__(self, format, mode, index_types,
                 start_coord='A1', direction='right'):
        self.indices = {}
        self.pairs = []

        if format == 'single':
            for index_type in index_types:
                if index_type.pk not in self.indices.keys():
                    self.indices[index_type.pk] = {'i7': [], 'i5': []}

                self.indices[index_type.pk]['i7'].extend(
                    self._to_list(
                        index_type.pk, index_type.indices_i7.all()))

                if mode == 'dual':
                    self.indices[index_type.pk]['i5'].extend(
                        self._to_list(
                            index_type.pk, index_type.indices_i5.all()))
        else:
            Pair = namedtuple('Pair', ['index1', 'index2', 'coordinate'])
            char_coord, num_coord = self._split_coordinate(start_coord)

            index_pairs = IndexPair.objects.filter(
                index_type=index_types[0],
                char_coord__gte=char_coord,
                num_coord__gte=num_coord,
            )

            if not index_pairs:
                raise ValueError(
                    f'No index pairs for Index Type "{index_types[0].name}" ' +
                    f'and start coordinate "{start_coord}".'
                )

            # Sort index pairs according to the chosen direction
            if direction == 'right':
                index_pairs = sorted(
                    index_pairs, key=lambda x: (x.char_coord, x.num_coord))
            else:  # down
                index_pairs = sorted(
                    index_pairs, key=lambda x: (x.num_coord, x.char_coord))

            self.pairs = [
                Pair(
                    self._to_list(index_types[0], [index_pair.index1])[0],
                    self._to_list(index_types[0], [index_pair.index2])[0],
                    index_pair.coordinate,
                )
                for index_pair in index_pairs
            ]

    def get_indices(self, index_group, index_type_id):
        return self.indices[index_type_id][index_group]

    @staticmethod
    def _to_list(index_type, indices):
        return list(map(lambda x: {
            'index_type': index_type,
            'prefix': x.prefix,
            'number': x.number,
            'index': x.index,
        }, indices))

    @staticmethod
    def _split_coordinate(coordinate):
        match = re.match(r'([A-Z]+)([1-9]+)', coordinate)
        if not match:
            raise ValueError('Invalid start coordinate.')
        return match[1], int(match[2])


class IndexGenerator:
    index_registry = None
    libraries = None
    samples = None
    num_libraries = 0
    num_samples = 0
    index_length = 0
    format = ''
    mode = ''
    MAX_ATTEMPTS = 5

    def __init__(self, library_ids, sample_ids, start_coord, direction):
        self._result = []

        self.libraries = Library.objects.filter(
            pk__in=library_ids
        ).select_related(
            'read_length', 'index_type',
        ).prefetch_related(
            'index_type__indices_i7', 'index_type__indices_i5',
        ).only(
            'id', 'name', 'sequencing_depth', 'read_length__id', 'index_type',
            'index_i7', 'index_i5',
        )

        self.samples = Sample.objects.filter(
            pk__in=sample_ids
        ).select_related(
            'read_length', 'index_type',
        ).prefetch_related(
            'index_type__indices_i7', 'index_type__indices_i5',
        ).only(
            'id', 'name', 'sequencing_depth', 'read_length__id', 'index_type',
        ).order_by('index_type')

        # self.num_libraries = self.libraries.count()
        # self.num_samples = self.samples.count()
        self.num_libraries = len(self.libraries)
        self.num_samples = len(self.samples)

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
        self.index_length = int(index_lengths[0])

        formats = [x.format for x in index_types]
        if len(set(formats)) != 1:
            raise ValueError('Index Types with mixed formats are not allowed.')
        self.format = formats[0]

        if self.format == 'plate' and len(index_types) != 1:
            raise ValueError('Index Type must be the same for all libraries ' +
                             'and samples if the format is "plate".')

        return index_types

    def generate(self):
        if self.num_libraries > 0:
            # Add all libraries directly to the result
            self.add_libraries_to_result()

            # Find indices for all samples
            self.find_indices()

        elif self.num_samples == 1:
            self.find_random_indices(self.samples[0])

        else:
            # Find best pair
            self.find_best_pair()

            # Find indices for the remaining samples
            self.find_indices(2)

        return self.result

    def find_indices(self, start=0):
        """ Find indices index I7 and I5 for a given sample. """
        samples = self.samples[start:]

        def get_indices(samples, index_group):
            index_key = f'index_{index_group}'
            current_indices = [x[index_key] for x in self._result]
            indices = []

            for sample in samples:
                index = self._find_index(index_group, sample, current_indices)
                # TODO: throw error if index wasn't found
                index = index['index']
                current_indices.append(index)
                indices.append(index)

            return self.sort_indices(indices)

        indices_i7 = get_indices(samples, 'i7')
        indices_i5 = [self.create_index_dict()] * len(indices_i7)

        if self.mode == 'dual':
            attempt = 0
            is_ok = False

            while attempt < self.MAX_ATTEMPTS and not is_ok:
                indices_i5 = get_indices(samples, 'i5')

                # Ensure uniqueness of the combination I7 <-> I5
                unique = [
                    True
                    if indices_i7[i]['index'] != indices_i5[i]['index']
                    else False
                    for i in range(len(indices_i7))
                ]

                if unique.count(True) == len(indices_i7):
                    is_ok = True

                attempt += 1

            if not is_ok:
                raise ValueError('Maximum number of attempts is exceeded.')

        for i, sample in enumerate(samples):
            self._result.append(
                self.create_result_dict(sample, indices_i7[i], indices_i5[i]))

    def find_best_pair(self):
        """
        Find a pair of best matching sample indices and add it to the result.
        """
        sample1 = self.samples[0]
        sample2 = self.samples[1]

        best_pair_i7 = self._find_pair('i7', sample1, sample2)
        if 'index1' not in best_pair_i7.keys():
            raise ValueError(
                'Could not find the best matching pair of Indices I7 for ' +
                f'"{sample1.name}" and "{sample2.name}".')

        index_i7_index1 = best_pair_i7['index1']
        index_i7_index2 = best_pair_i7['index2']
        index_i5_index1 = self.create_index_dict()
        index_i5_index2 = self.create_index_dict()

        if self.mode == 'dual':
            best_pair_i5 = self._find_pair(
                'i5', sample1, sample2, index_i7_index1, index_i7_index2)
            if 'index1' not in best_pair_i5.keys():
                raise ValueError(
                    'Could not find the best matching pair of Indices I5 ' +
                    f'for "{sample1.name}" and "{sample2.name}".')

            index_i5_index1 = best_pair_i5['index1']
            index_i5_index2 = best_pair_i5['index2']

        # First sample
        self._result.append(
            self.create_result_dict(sample1, index_i7_index1, index_i5_index1))

        # Second sample
        self._result.append(
            self.create_result_dict(sample2, index_i7_index2, index_i5_index2))

    def find_random_indices(self, sample):
        """ Find random indices I7/I5 for a given sample. """
        # TODO: deal with I7-I5 pairs

        index_i7 = random.choice(
            self.index_registry.get_indices('i7', sample.index_type.pk))
        index_i5 = self.create_index_dict()

        if self.mode == 'dual':
            # Ensure I7/I5 uniqueness
            indices_i5 = [x for x in self.index_registry.get_indices(
                'i5', sample.index_type.pk) if x['index'] != index_i7['index']]

            if any(indices_i5):
                index_i5 = random.choice(indices_i5)
            else:
                raise ValueError(
                    f'Failed to generate Index I5 for {sample.name}')

        self._result.append(
            self.create_result_dict(sample, index_i7, index_i5))

    def add_libraries_to_result(self):
        """ Add all libraries directly to the result. """

        def idx_dict(class_model, index, index_type):
            idx = class_model.objects.filter(
                index=index, index_type=index_type)
            if idx:
                idx = self.create_index_dict(
                    index_type.pk, idx[0].prefix, idx[0].number, idx[0].index)
            else:
                idx = self.create_index_dict('', '', '', index)
            return idx

        no_index = []
        with_index = []

        for library in self.libraries:
            index_i7 = idx_dict(IndexI7, library.index_i7, library.index_type)
            index_i5 = self.create_index_dict()

            if self.mode == 'dual':
                index_i5 = idx_dict(
                    IndexI5, library.index_i5, library.index_type)

            d = self.create_result_dict(library, index_i7, index_i5)
            if d['index_i7']['prefix'] != '':
                with_index.append(d)
            else:
                no_index.append(d)

        with_index = sorted(with_index, key=lambda x: (
            x['index_i7']['prefix'], int(x['index_i7']['number'])
        ))

        self._result.extend(no_index + with_index)

    def _find_index(self, index_group, sample, current_indices):
        """ Helper function for find_indices(). """
        index_key = f'index_{index_group}'
        res_index = {'avg_score': 100.0}
        indices_in_result = [x['index'] for x in current_indices]

        indices = list(self.index_registry.get_indices(
            index_group, sample.index_type.pk))
        random.shuffle(indices)

        # Ensure uniqueness
        if self.mode == 'single':
            indices = [
                x for x in indices
                if x['index'] not in indices_in_result
            ]

        for index in indices:
            scores = self._calculate_n_scores(sample, index, index_key)
            avg_score = sum(scores) / self.index_length
            if avg_score < res_index['avg_score']:
                res_index = {'avg_score': avg_score, 'index': index}

        return res_index

    def _find_pair(self, index_group, sample1, sample2, idx1=None, idx2=None):
        """ Helper function for find_best_pair(). """
        best_pair = {'avg_score': 100.0}  # the worst score
        indices1 = self.index_registry.get_indices(
            index_group, sample1.index_type.pk)
        indices2 = self.index_registry.get_indices(
            index_group, sample2.index_type.pk)

        if idx1 is not None:
            indices1 = [x for x in indices1 if x['index'] != idx1['index']]
        if idx2 is not None:
            indices2 = [x for x in indices2 if x['index'] != idx2['index']]

        for index1 in indices1:
            for index2 in indices2:
                if index1 != index2:
                    scores = self._best_pair_scores(
                        index1['index'],
                        index2['index'],
                        sample1.sequencing_depth,
                        sample2.sequencing_depth,
                    )

                    avg_score = sum(scores) / self.index_length
                    if avg_score < best_pair['avg_score']:
                        best_pair = {
                            'avg_score': avg_score,
                            'index1': index1,
                            'index2': index2,
                        }

        return best_pair

    def _best_pair_scores(self, index1, index2, depth1, depth2):
        """
        Calculate the scores for two given indices.

        Score is an absolute difference between the sequencing depths of
        the two indices divided by the total sequencing depth (in %).

        The ideal score is 0.0 (50% green and 50% red),
        an acceptable score is 60.0 (80%/20% or 20%/80%).

        If the score > 60%, then the indices are not compatible.
        """
        index1 = self.convert_index(index1)
        index2 = self.convert_index(index2)
        total_depth = depth1 + depth2
        result = []

        for cycle in range(self.index_length):
            if index1[cycle] != index2[cycle]:
                difference = abs(depth1 - depth2) / total_depth * 100
                result.append(difference)
            else:
                result.append(100.0)

        return result

    def _calculate_n_scores(self, current_sample, current_index, index_key):
        """
        Calculate the score for N given samples.

        The scoring method is the same as in best_pair_scores() but
        for N samples.
        """
        result = []

        # Calculate color distribution for libraries and samples
        # which are already in the result
        distribution = [{'G': 0, 'R': 0} for _ in range(self.index_length)]
        total_depth = 0
        for record in self._result:
            index = self.convert_index(record[index_key]['index'])
            if index != '':
                for cycle in range(self.index_length):
                    color = index[cycle]
                    distribution[cycle][color] += record['sequencing_depth']
                total_depth += record['sequencing_depth']
        total_depth += current_sample.sequencing_depth

        # Calculate the scores
        for cycle in range(self.index_length):
            index = self.convert_index(current_index['index'])
            color = index[cycle]
            distribution[cycle][color] += current_sample.sequencing_depth

            if distribution[cycle]['G'] > 0 and distribution[cycle]['R'] > 0:
                difference = abs((distribution[cycle]['G'] -
                                  distribution[cycle]['R']) /
                                 total_depth) * 100
                result.append(difference)
            else:
                result.append(100.0)

        return result

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

            # Needed for the client
            for i in range(len(index_i7['index'])):
                rec[f'index_i7_{i + 1}'] = index_i7['index'][i]
            for i in range(len(index_i5['index'])):
                rec[f'index_i5_{i + 1}'] = index_i5['index'][i]

            result.append(rec)

        return result

    @staticmethod
    def convert_index(index):
        """ Convert A/C into R (red) and T into G (green). """
        return re.sub('T', 'G', re.sub('A|C', 'R', index))

    @staticmethod
    def sort_indices(indices):
        return sorted(
            indices, key=lambda x: (x['index_type'], int(x['number'])))

    @staticmethod
    def create_index_dict(index_type='', prefix='', number='', index=''):
        return {
            'index_type': index_type,
            'prefix': prefix,
            'number': number,
            'index': index,
        }

    @staticmethod
    def create_result_dict(obj, index_i7, index_i5):
        return {
            'pk': obj.pk,
            'name': obj.name,
            'record_type': obj.__class__.__name__,
            'read_length': obj.read_length_id,
            'sequencing_depth': obj.sequencing_depth,
            'index_i7': index_i7,
            'index_i5': index_i5,
        }
