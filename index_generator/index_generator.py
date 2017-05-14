import re
import random

from library_sample_shared.models import IndexI7, IndexI5
from library.models import Library
from sample.models import Sample


class IndexGenerator:
    """ Main IndexGenerator class. """
    def __init__(self, library_ids=(), sample_ids=()):
        self._result = []
        self._indices = {}

        self._libraries = Library.objects.filter(id__in=library_ids)
        self._samples = Sample.objects.filter(id__in=sample_ids)  # QuerySet
        self._num_libraries = self._libraries.count()
        self._num_samples = self._samples.count()
        self._index_mode = None    # dual/single
        self._index_length = None  # 6/8 nucleotides

        if self._num_samples == 0:
            raise ValueError('No samples.')

        read_lengths = set([l.read_length.pk for l in self._libraries] +
                           [s.read_length.pk for s in self._samples])
        if len(read_lengths) != 1:
            raise ValueError('Read lengths must be the same.')

        self.construct_index_registry()

    def construct_index_registry(self):
        """ Construct a dictionary with indices. """
        # Index types for all libraries and samples
        index_types = \
            [l.index_type for l in self._libraries if l.index_type] + \
            [s.index_type for s in self._samples if s.index_type]

        if len(index_types) != self._num_libraries + self._num_samples:
            raise ValueError('Index Type must be set for all ' +
                             'libraries and samples.')
        index_types = list(set(index_types))

        for index_type in index_types:
            # No pooling of dual and single indices
            mode = 'dual' if index_type.is_index_i7 and \
                index_type.is_index_i5 else 'single'
            if not self._index_mode:
                self._index_mode = mode
            elif mode != self._index_mode:
                raise ValueError('Pooling of dual and single indices ' +
                                 'is not allowed.')

            # No pooling of indices with the length of 6 and 8
            # nucleotides (no mixed length)
            index_length = int(index_type.get_index_length_display())
            if not self._index_length:
                self._index_length = index_length
            elif index_length != self._index_length:
                raise ValueError('Pooling of indices with 6 and 8 ' +
                                 'nucleotides (mixed) is not allowed.')

            self._indices[index_type.pk] = {'i7': []}
            self._indices[index_type.pk]['i7'].extend([
                {
                    'index': idx.index,
                    'index_id': idx.index_id,
                }
                for idx in index_type.indices_i7.all()
            ])

            if self._index_mode == 'dual':
                self._indices[index_type.pk].update({'i5': []})
                self._indices[index_type.pk]['i5'].extend([
                    {
                        'index': idx.index,
                        'index_id': idx.index_id,
                    }
                    for idx in index_type.indices_i5.all()
                ])

    def _update_indices(self, idx_type_id, idx_type, index):
        """ Remove a given index from the index registry. """
        try:
            self._indices[idx_type_id][idx_type].pop(
                self._indices[idx_type_id][idx_type].index(index)
            )
        except ValueError:
            pass

    @staticmethod
    def _convert_index(index):
        """ Convert A/C into R (red) and T into G (green). """
        return re.sub('T', 'G', re.sub('A|C', 'R', index))

    def _best_pair_scores(self, index1, index2, depth1, depth2):
        """
        Calculate the score for two given indices.

        Score is an absolute difference between the sequence depths of
        the two indices divided by the total sequence depth (in %).

        The ideal score is 0.0 (50% green and 50% red),
        an acceptable score is 60.0 (80%/20% or 20%/80%).

        If the score > 60%, then the indices are not compatible.
        """
        index1 = self._convert_index(index1)
        index2 = self._convert_index(index2)
        total_depth = depth1 + depth2
        result = []

        for cycle in range(self._index_length):
            if index1[cycle] != index2[cycle]:
                difference = abs(depth1 - depth2) / total_depth * 100
                if difference <= 60.0:
                    result.append(difference)
                else:
                    # If color diversity is low (81%/19% or worse) in
                    # one of the cycles
                    return -1
            else:
                # If nucleotides are only red (A/C) or green (G/T) in a cycle
                return -1

        return result

    def _calculate_scores_n(self, current_record, current_index, index_label):
        """
        Calculate the score for N given libraries/samples.

        The scoring method is the same as in best_pair_scores() but
        for N libraries and samples.
        """
        result = []

        # Calculate color distribution for libraries
        # which are already in the result
        color_distribution = [
            {'G': 0, 'R': 0}
            for _ in range(self._index_length)
        ]
        total_depth = 0
        for record in self._result:
            index = self._convert_index(record[index_label]['index'])
            if index != '':
                for cycle in range(self._index_length):
                    color = index[cycle]
                    color_distribution[cycle][color] += record['depth']
                total_depth += record['depth']
        total_depth += current_record.sequencing_depth

        # Calculate scores for the libraries in the result with a new library
        for cycle in range(self._index_length):
            index = self._convert_index(current_index['index'])
            color = index[cycle]
            color_distribution[cycle][color] += current_record.sequencing_depth

            if color_distribution[cycle]['G'] > 0 and \
                    color_distribution[cycle]['R'] > 0:
                difference = abs((color_distribution[cycle]['G'] -
                                  color_distribution[cycle]['R']) /
                                 total_depth) * 100

                if difference <= 60.0:
                    result.append(difference)
                else:
                    # If color diversity is low (81%/19% or worse) in
                    # one of the cycles
                    return -1
            else:
                # If nucleotides are only red (A/C) or green (G/T) in a cycle
                return -1

        return result

    @staticmethod
    def _create_result_dict(sample, index_i7, index_i5):
        return {
            'name': sample.name,
            'barcode': sample.barcode,
            'sample_id': sample.pk,
            'read_length': sample.read_length_id,
            'depth': sample.sequencing_depth,
            'index_type': sample.index_type.pk,
            'index_i7': index_i7,
            'index_i5': index_i5,
        }

    @staticmethod
    def _create_index_dict(index='', index_id=''):
        return {'index': index, 'index_id': index_id}

    def _find_pair(self, index_group, sample1, sample2):
        """ Helper function for find_best_pair(). """
        best_pair = {'avg_score': 100.0}  # the worst score
        for index1 in self._indices[sample1.index_type.pk][index_group]:
            for index2 in self._indices[sample2.index_type.pk][index_group]:
                if index1 != index2:
                    scores = self._best_pair_scores(
                        index1['index'],
                        index2['index'],
                        sample1.sequencing_depth,
                        sample2.sequencing_depth,
                    )

                    # If both indices are compatible
                    if scores != -1:
                        avg_score = sum(scores) / self._index_length
                        if avg_score < best_pair['avg_score']:
                            best_pair = {
                                'index1': index1,
                                'index2': index2,
                                'avg_score': avg_score,
                            }
        return best_pair

    def _find_best_pair(self):
        """
        Find a pair of best matching sample indices and add it to the result.
        """
        sample1 = self._samples[0]
        sample2 = self._samples[1]

        best_pair_i7 = self._find_pair('i7', sample1, sample2)
        if 'index1' not in best_pair_i7.keys():
            raise ValueError('Could not find the best matching pair of ' +
                             'indices I7.')

        self._update_indices(
            sample1.index_type.pk, 'i7', best_pair_i7['index1'],
        )
        self._update_indices(
            sample2.index_type.pk, 'i7', best_pair_i7['index2'],
        )

        index_i7_dict_index1 = best_pair_i7['index1']
        index_i7_dict_index2 = best_pair_i7['index2']
        index_i5_dict_index1 = self._create_index_dict()
        index_i5_dict_index2 = self._create_index_dict()

        if self._index_mode == 'dual':
            best_pair_i5 = self._find_pair('i5', sample1, sample2)
            if 'index1' not in best_pair_i7.keys():
                raise ValueError('Could not find the best matching pair of ' +
                                 'indices I5.')

            self._update_indices(
                sample1.index_type.pk, 'i5', best_pair_i5['index1'],
            )
            self._update_indices(
                sample2.index_type.pk, 'i5', best_pair_i5['index2'],
            )

            index_i5_dict_index1 = best_pair_i5['index1']
            index_i5_dict_index2 = best_pair_i5['index2']

        # First sample
        self._result.append(
            self._create_result_dict(
                sample1,
                index_i7_dict_index1,
                index_i5_dict_index1,
            )
        )

        # Second sample
        self._result.append(
            self._create_result_dict(
                sample2,
                index_i7_dict_index2,
                index_i5_dict_index2,
            )
        )

    def _find_index(self, index_group, sample):
        """ Helper function for generate_indices(). """
        res_index = {'avg_score': 100.0}
        index_key = 'index_i7' if index_group == 'i7' else 'index_i5'

        for index in self._indices[sample.index_type.pk][index_group]:
            scores = self._calculate_scores_n(sample, index, index_key)

            # If indices are compatible
            if scores != -1:
                indices_in_result = [
                    res[index_key]['index']
                    for res in self._result
                ]
                avg_score = sum(scores) / self._index_length

                # Choose an index with a better average score
                # and make sure it's not in the result
                if avg_score < res_index['avg_score'] \
                        and index['index'] not in indices_in_result:
                    res_index = {
                        'index': index,
                        'avg_score': avg_score
                    }

        return res_index

    def _generate_indices(self, sample, i):
        """ Generate indices index I7 and I5 for a given sample. """
        found_index_i7 = self._find_index('i7', sample)
        found_index_i5 = self._create_index_dict()

        # If a matching index cannot be found
        if 'index' not in found_index_i7.keys():
            if i + 1 == self._num_samples:
                # Given libraries, if an index cannot be found
                # for the last sample, raise an exception
                raise ValueError('Cannot generate Index I7 for %s.' %
                                 sample.name)
            else:
                # Choose a random index and try to generate indices
                # for the remaining samples
                found_index_i7 = random.choice(
                    self._indices[sample.index_type.pk]['i7'],
                )
        else:
            found_index_i7 = found_index_i7['index']

        self._update_indices(sample.index_type.pk, 'i7', found_index_i7)

        if self._index_mode == 'dual':
            found_index_i5 = self._find_index('i5', sample)

            # If a matching index cannot be found
            if 'index' not in found_index_i5.keys():
                if i + 1 == self._num_samples:
                    # Given libraries, if an index cannot be found
                    # for the last sample, raise an exception
                    raise ValueError('Cannot generate Index I5 for %s.' %
                                     sample.name)
                else:
                    # Choose a random index and try to generate indices
                    # for the remaining samples
                    found_index_i5 = random.choice(
                        self._indices[sample.index_type.pk]['i5'],
                    )
            else:
                found_index_i5 = found_index_i5['index']

            self._update_indices(sample.index_type.pk, 'i5', found_index_i5)

        # Result
        self._result.append(self._create_result_dict(
            sample,
            found_index_i7,
            found_index_i5,
        ))

    def _add_libraries_to_result(self):
        """ Add all libraries directly to the result. """
        for library in self._libraries:
            index_i5 = self._create_index_dict()

            index_i7 = IndexI7.objects.filter(
                index=library.index_i7,
                index_type=library.index_type,
            )

            if index_i7:
                index_i7 = self._create_index_dict(index_i7[0].index,
                                                   index_i7[0].index_id)
            else:
                index_i7 = self._create_index_dict(library.index_i7, '')
            self._update_indices(library.index_type.pk, 'i7', index_i7)

            if self._index_mode == 'dual':
                index_i5 = IndexI5.objects.filter(
                    index=library.index_i5,
                    index_type=library.index_type,
                )

                if index_i5:
                    index_i5 = self._create_index_dict(index_i5[0].index,
                                                       index_i5[0].index_id)
                else:
                    index_i5 = self._create_index_dict(library.index_i5, '')
                self._update_indices(library.index_type.pk, 'i5', index_i5)

            self._result.append({
                'name': library.name,
                'barcode': library.barcode,
                'library_id': library.pk,
                'read_length': library.read_length_id,
                'depth': library.sequencing_depth,
                'index_type': library.index_type.pk,
                'index_i7': index_i7,
                'index_i5': index_i5,
            })

    def _sort_indices(self):
        """ Sort generated indices in ascending order. """
        result = sorted(self._result, key=lambda x: (x['barcode'],
                                                     x['index_type']))

        # Create a dictionary with index types in indices I7/I5
        indices_dict = {}
        for record in result:
            if 'sample_id' in record.keys():
                if record['index_type'] not in indices_dict.keys():
                    indices_dict[record['index_type']] = []
                indices_dict[record['index_type']].append({
                    'index_i7': record['index_i7'],
                    'index_i5': record['index_i5'],
                })

        # Sort the indices by Index I7
        for index_type, indices in indices_dict.items():
            indices_dict[index_type] = sorted(indices,
                                              key=lambda x: x['index_i7']
                                              ['index_id'])

        # Change the generated indices according to the order
        for record in result:
            if 'sample_id' in record.keys():
                record.update(indices_dict[record['index_type']].pop(0))

        self._result = result

    @property
    def result(self):
        """ Construct a dictionary with all records and their indices. """
        result = []

        for record in self._result:
            index_i7 = record['index_i7']
            index_i5 = record['index_i5']

            rec = {
                'name': record['name'],
                'sequencingDepth': record['depth'],
                'readLength': record['read_length'],
                'indexI7Id': index_i7['index_id'],
                'indexI5Id': index_i5['index_id'],
            }

            if 'sample_id' in record.keys():
                rec.update({
                    'recordType': 'S',
                    'sampleId': record['sample_id']
                })

            if 'library_id' in record.keys():
                rec.update({
                    'recordType': 'L',
                    'libraryId': record['library_id']
                })

            for i in range(len(index_i7['index'])):
                rec.update({'indexI7_' + str(i + 1): index_i7['index'][i]})

            for i in range(len(index_i5['index'])):
                rec.update({'indexI5_' + str(i + 1): index_i5['index'][i]})

            result.append(rec)

        return result

    def generate(self):
        """ Main class method for generating indices. """
        if self._num_libraries > 0:
            # Add all libraries directly to the result
            case = 1
            self._add_libraries_to_result()
        else:
            # Generate indices only for samples
            case = 2
            if self._num_samples > 1:
                self._find_best_pair()
            else:
                raise ValueError('Select at least two samples.')

        if case == 1:
            # If there are any libraries, consider all samples
            start = 0
        else:
            # case 2: generate indices for all samples,
            # except for the first two (the best pair)
            start = 2

        for i, sample in enumerate(self._samples[start:self._num_samples]):
            self._generate_indices(sample, i)

        self._sort_indices()

        return self.result
