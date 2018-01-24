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
        self.index_types = index_types
        self.format = format
        self.mode = mode
        self.indices = {}
        self.pairs = {}

        if self.format == 'single':
            self.fetch_indices()
        else:
            self.fetch_pairs(start_coord, direction)

    def fetch_indices(self):
        for index_type in self.index_types:
            if index_type.pk not in self.indices.keys():
                self.indices[index_type.pk] = {'i7': [], 'i5': []}

            self.indices[index_type.pk]['i7'] = self.to_list(
                index_type.pk, index_type.indices_i7.all())

            if self.mode == 'dual':
                self.indices[index_type.pk]['i5'] = self.to_list(
                    index_type.pk, index_type.indices_i5.all())

    def fetch_pairs(self, start_coord, direction):
        Pair = namedtuple('Pair', ['index1', 'index2', 'coordinate'])
        char_coord, num_coord = self.split_coordinate(start_coord)

        for index_type in self.index_types:
            if index_type.pk not in self.indices.keys():
                self.pairs[index_type.pk] = []

            index_pairs = IndexPair.objects.filter(
                index_type=index_type,
                char_coord__gte=char_coord,
                num_coord__gte=num_coord,
            )

            if not index_pairs:
                raise ValueError(
                    f'No index pairs for Index Type "{index_type.name}" ' +
                    f'and start coordinate "{start_coord}".'
                )

            # Sort index pairs according to the chosen direction
            if direction == 'right':
                index_pairs = sorted(
                    index_pairs, key=lambda x: (x.char_coord, x.num_coord))
            else:  # down
                index_pairs = sorted(
                    index_pairs, key=lambda x: (x.num_coord, x.char_coord))

            for pair in index_pairs:
                index1 = self.create_index_dict(
                    pair.index_type.pk, pair.index1.prefix,
                    pair.index1.number, pair.index1.index)

                if self.mode == 'dual':
                    index2 = self.create_index_dict(
                        pair.index_type.pk, pair.index2.prefix,
                        pair.index2.number, pair.index2.index)
                else:
                    index2 = self.create_index_dict()

                self.pairs[index_type.pk].append(Pair(
                    index1, index2, pair.coordinate))

    def get_indices(self, index_group, index_type_id):
        # Return empty list if index_type_id or index_group don't exist
        return self.indices.get(
            index_type_id, {'i7': [], 'i5': []}).get(index_group, [])

    def get_pairs(self, index_type_id):
        return self.pairs.get(index_type_id, [])

    def to_list(self, index_type, indices):
        return list(map(lambda x: self.create_index_dict(
            index_type, x.prefix, x.number, x.index), indices))

    @staticmethod
    def create_index_dict(index_type='', prefix='', number='', index=''):
        return {
            'index_type': index_type,
            'prefix': prefix,
            'number': number,
            'index': index,
        }

    @staticmethod
    def split_coordinate(coordinate):
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
        ).order_by('index_type', 'sequencing_depth', 'name')

        # self.samples = sorted(self.samples, key=lambda x: (
        #     x.index_type.pk, x.sequencing_depth, int(x.barcode[3:])
        # ))

        # self.num_libraries = self.libraries.count()
        # self.num_samples = self.samples.count()
        self.num_libraries = len(self.libraries)
        self.num_samples = len(self.samples)

        if self.num_samples == 0:
            raise ValueError('No samples provided.')

        records = list(itertools.chain(self.libraries, self.samples))
        read_lengths = [x.read_length for x in records]
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

        return index_types

    def generate(self):
        if self.num_libraries > 0:
            self.add_libraries_to_result()

        if self.format == 'single':
            self.find_indices()
        else:
            self.find_pairs()

        return self.result

    def add_libraries_to_result(self):
        """ Add all libraries directly to the result. """

        def idx_dict(class_model, index, index_type):
            idx = class_model.objects.filter(
                index=index, index_type=index_type)
            if idx:
                idx = self.index_registry.create_index_dict(
                    index_type.pk, idx[0].prefix, idx[0].number, idx[0].index)
            else:
                idx = self.index_registry.create_index_dict('', '', '', index)
            return idx

        no_index = []
        with_index = []

        for library in self.libraries:
            index_i7 = idx_dict(IndexI7, library.index_i7, library.index_type)
            index_i5 = self.index_registry.create_index_dict()

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

    def find_indices(self):
        """ Find indices I7/I5 for the selected samples. """
        depths = [x.sequencing_depth for x in self.samples]

        # If there are libraries in the result, extract their indices
        if any(self._result):
            init_indices_i7 = []
            init_indices_i5 = []

            for item in self._result:
                init_indices_i7.append(item['index_i7'])
                init_indices_i5.append(item['index_i5'])

            samples = self.samples
            depths = [x['sequencing_depth'] for x in self._result] + depths

        else:
            index_i7_1, index_i5_1 = self.find_random_indices(self.samples[0])
            samples = self.samples[1:]

            # If a single sample was selected, add it to the result
            if not samples:
                self._result.append(
                    self.create_result_dict(
                        self.samples[0], index_i7_1, index_i5_1))
                return

            init_indices_i7 = [index_i7_1]
            init_indices_i5 = [index_i5_1]

        indices_i7 = self.get_indices(samples, depths, 'i7', init_indices_i7)

        if self.mode == 'single':
            indices_i5 = [
                self.index_registry.create_index_dict()] * len(indices_i7)

        else:
            attempt = 0
            is_ok = False

            while attempt < self.MAX_ATTEMPTS and not is_ok:
                indices_i5 = self.get_indices(
                    samples, depths, 'i5', init_indices_i5)

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

        # Skip indices which are already in the result
        indices_i7 = indices_i7[len(self._result):]
        indices_i5 = indices_i5[len(self._result):]

        # Add generated indices to the result
        for i, sample in enumerate(self.samples):
            self._result.append(
                self.create_result_dict(
                    sample, indices_i7[i], indices_i5[i]))

    def find_random_indices(self, sample):
        """ Find random indices I7/I5 for a given sample. """

        index_i7 = random.choice(
            self.index_registry.get_indices('i7', sample.index_type.pk))
        index_i5 = self.index_registry.create_index_dict()

        if self.mode == 'dual':
            # Ensure I7/I5 uniqueness
            indices_i5 = [x for x in self.index_registry.get_indices(
                'i5', sample.index_type.pk) if x['index'] != index_i7['index']]

            if any(indices_i5):
                index_i5 = random.choice(indices_i5)
            else:
                raise ValueError(
                    f'Failed to generate Index I5 for {sample.name}')

        return index_i7, index_i5

    def get_indices(self, samples, depths, index_group, init_indices):
        """ """
        attempt = 0

        while attempt < self.MAX_ATTEMPTS:
            indices = list(init_indices)

            try:
                for sample in samples:
                    index = self.find_index(
                        sample, index_group, indices, depths)
                    if 'index' not in index:
                        raise ValueError('Index not found.')
                    index = index['index']
                    indices.append(index)
                indices = self.sort_indices(indices)
            except ValueError:
                pass

            if len(indices) == len(self.samples) + len(self._result):
                return indices

            attempt += 1

        raise ValueError(f'Could not generate indices "{index_group}" ' +
                         'for the selected samples.')

    def find_index(self, sample, index_group, current_indices, depths):
        """ Helper function for find_indices(). """
        indices_in_result = [x['index'] for x in current_indices]
        result_index = {'avg_score': 100.0}

        indices = list(self.index_registry.get_indices(
            index_group, sample.index_type.pk))
        random.shuffle(indices)

        # Ensure uniqueness
        if self.mode == 'single':
            indices = [
                x for x in indices
                if x['index'] not in indices_in_result
            ]

        # Calculate color distribution
        color_distribution, total_depth = self.calculate_color_distribution(
            indices_in_result, depths, sample)

        for index in indices:
            converted_index = self.convert_index(index['index'])
            scores = self.calculate_scores(
                sample, converted_index, color_distribution, total_depth)
            avg_score = sum(scores) / self.index_length
            if avg_score < result_index['avg_score']:
                result_index = {'avg_score': avg_score, 'index': index}

        return result_index

    def find_pairs(self):
        """ """
        depths = [x.sequencing_depth for x in self.samples]

        # If there are libraries in the result, extract their indices
        if any(self._result):
            init_pairs = list(map(
                lambda x: (x['index_i7'], x['index_i5']), self._result))

            samples = self.samples
            depths = [x['sequencing_depth'] for x in self._result] + depths

        else:
            pair_1 = self.find_random_pair(self.samples[0])
            samples = self.samples[1:]

            # If a single sample was selected, add it to the result
            if not samples:
                self._result.append(
                    self.create_result_dict(
                        self.samples[0], pair_1[0], pair_1[1]))
                return

            init_pairs = [pair_1]

        pairs = self.get_pairs(samples, depths, init_pairs)

        # Skip pairs which are already in the result
        pairs = pairs[len(self._result):]

        # Add generated pairs to the result
        for i, sample in enumerate(self.samples):
            self._result.append(
                self.create_result_dict(
                    sample, pairs[i][0], pairs[i][1]))

    def find_random_pair(self, sample):
        """ """
        pair = random.choice(self.index_registry.get_pairs(
            sample.index_type.pk))
        return (pair.index1, pair.index2)

    def get_pairs(self, samples, depths, init_pairs):
        """ """
        attempt = 0

        while attempt < self.MAX_ATTEMPTS:
            pairs = list(init_pairs)

            try:
                for sample in samples:
                    pair = self.find_pair(sample, depths, pairs)
                    if 'pair' not in pair:
                        raise ValueError('Pair not found.')
                    pair = pair['pair']
                    pairs.append(pair)
                pairs = self.sort_pairs(pairs)
            except ValueError:
                pass

            if len(pairs) == len(self.samples) + len(self._result):
                return pairs

            attempt += 1

        raise ValueError(f'Could not generate pairs for the selected samples.')

    def find_pair(self, sample, depths, current_pairs):
        """ """
        result_pair = {'avg_score': 100.0}
        pairs = list(self.index_registry.get_pairs(sample.index_type.pk))
        random.shuffle(pairs)

        # Ensure uniqueness
        if self.mode == 'single':
            pairs = [
                x for x in pairs
                if (x.index1, x.index2) not in current_pairs
            ]

        if self.mode == 'single':
            indices_in_result = list(map(
                lambda x: x[0]['index'], current_pairs))
        else:
            indices_in_result = list(map(
                lambda x: x[0]['index'] + x[1]['index'],
                current_pairs,
            ))

        # Calculate color distribution
        index_length = len(indices_in_result[0])
        color_distribution, total_depth = self.calculate_color_distribution(
            indices_in_result, depths, sample)

        for pair in pairs:
            converted_index = self.convert_index(
                self._concat_index_pair(pair))
            scores = self.calculate_scores(
                sample, converted_index, color_distribution, total_depth)
            avg_score = sum(scores) / index_length
            if avg_score < result_pair['avg_score']:
                result_pair = {
                    'avg_score': avg_score,
                    'pair': (pair.index1, pair.index2),
                }

        return result_pair

    def calculate_color_distribution(self, indices, sequencing_depths, sample):
        """ """
        total_depth = 0
        index_length = len(indices[0])
        color_distribution = [{'G': 0, 'R': 0} for _ in range(index_length)]

        for i, index in enumerate(indices):
            idx = self.convert_index(index)
            for cycle in range(index_length):
                color = idx[cycle]
                color_distribution[cycle][color] += sequencing_depths[i]
            total_depth += sequencing_depths[i]
        total_depth += sample.sequencing_depth

        return color_distribution, total_depth

    def calculate_scores(self, current_sample, current_converted_index,
                         current_color_distribution, total_depth):
        """
        Calculate the scores for a given sample.

        Score is an absolute difference between the sequencing depths of
        the two indices divided by the total sequencing depth (in %).

        The ideal score is 0.0 (50% green and 50% red),
        an acceptable score is 60.0 (80%/20% or 20%/80%).

        If the score > 60%, then the indices are not compatible.
        """
        distribution = list(current_color_distribution)
        result = []

        for cycle in range(len(current_converted_index)):
            color = current_converted_index[cycle]
            distribution[cycle][color] += current_sample.sequencing_depth

            if distribution[cycle]['G'] > 0 and distribution[cycle]['R'] > 0:
                difference = abs((distribution[cycle]['G'] -
                                  distribution[cycle]['R']) /
                                 total_depth) * 100
                result.append(difference)
            else:
                result.append(100.0)

        return result

    def _concat_index_pair(self, pair):
        return pair.index1['index'] + pair.index2['index'] \
            if self.mode == 'dual' else pair.index1['index']

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
    def sort_pairs(pairs):
        # Sort pairs only by Index I7 ID
        return sorted(
            pairs, key=lambda x: (x[0]['index_type'], int(x[0]['number'])))

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
