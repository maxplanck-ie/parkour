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

        if self._num_samples == 0:
            raise ValueError('No samples.')

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
            self._indices[index_type.pk] = {'i7': [], 'i5': []}
            self._indices[index_type.pk]['i7'].extend([
                {
                    'index': idx.index,
                    'index_id': idx.index_id,
                }
                for idx in index_type.indices_i7.all()
            ])
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

        for cycle in range(6):
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

    def _calculate_scores_n(self, current_record, current_index, index_label,
                            num_cycle):
        """
        Calculate the score for N given libraries/samples.

        The scoring method is the same as in best_pair_scores() but
        for N libraries and samples.
        """
        result = []

        # Calculate color distribution for libraries
        # which are already in the result
        color_distribution = [{'G': 0, 'R': 0} for _ in range(num_cycle)]
        total_depth = 0
        for record in self._result:
            index = self._convert_index(record[index_label]['index'])
            if index != '':
                for cycle in range(num_cycle):
                    color = index[cycle]
                    color_distribution[cycle][color] += record['depth']
                total_depth += record['depth']
        total_depth += current_record.sequencing_depth

        # Calculate scores for the libraries in the result with a new library
        for cycle in range(num_cycle):
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
            'sample_id': sample.pk,
            'read_length': sample.read_length_id,
            'depth': sample.sequencing_depth,
            'index_i7': index_i7,
            'index_i5': index_i5,
        }

    @staticmethod
    def _create_index_dict(index='', index_id=''):
        return {
            'index': index,
            'index_id': index_id,
        }

    def _find_best_pair(self):
        """
        Find a pair of best matching sample indices (I7) and
        add it to the result.
        """
        sample1 = self._samples[0]
        sample2 = self._samples[1]

        # TODO@me: ensure index_type != ''
        best_pair = {'avg_score': 100.0}  # the worst score
        for index1 in self._indices[sample1.index_type.pk]['i7']:
            for index2 in self._indices[sample2.index_type.pk]['i7']:
                if index1 != index2:
                    scores = self._best_pair_scores(
                        index1['index'],
                        index2['index'],
                        sample1.sequencing_depth,
                        sample2.sequencing_depth,
                    )

                    # If both indices are compatible
                    if scores != -1:
                        avg_score = sum(scores) / 6
                        if avg_score < best_pair['avg_score']:
                            best_pair = {
                                'index1': index1,
                                'index2': index2,
                                'avg_score': avg_score,
                            }

        # If the best pair was found
        if 'index1' in best_pair.keys():
            self._result.extend([
                self._create_result_dict(
                    sample1,
                    best_pair['index1'],
                    self._create_index_dict('', ''),  # Index I5
                ),
                self._create_result_dict(
                    sample2,
                    best_pair['index2'],
                    self._create_index_dict('', ''),  # Index I5
                ),
            ])

            self._update_indices(
                sample1.index_type.pk, 'i7', best_pair['index1'],
            )

            self._update_indices(
                sample2.index_type.pk, 'i7', best_pair['index2'],
            )
        else:
            raise ValueError('Could not find the best ' +
                             'matching pair of indices.')

    def _generate_index_i7(self, sample, i):
        """ Generate index I7 for a given sample. """
        index_i7 = {'avg_score': 100.0}

        for index in self._indices[sample.index_type.pk]['i7']:
            scores = self._calculate_scores_n(sample, index, 'index_i7', 6)

            # If indices are compatible
            if scores != -1:
                indices_in_result = [
                    res['index_i7']['index']
                    for res in self._result
                ]
                avg_score = sum(scores) / 6

                # Choose an index with a better average score
                # and make sure it's not in the result
                if avg_score < index_i7['avg_score'] \
                        and index['index'] not in indices_in_result:
                    index_i7 = {
                        'index': index,
                        'avg_score': avg_score
                    }

        # If an index has been generated
        if 'index' in index_i7.keys():
            self._result.append(self._create_result_dict(
                sample,
                index_i7['index'],
                self._create_index_dict('', ''),  # Index I5
            ))

            self._update_indices(sample.index_type.pk, 'i7', index_i7['index'])

        else:
            if i + 1 == self._num_samples:
                # Given libraries, if an index cannot be found
                # for the last sample, raise an exception
                raise ValueError('Could not generate indices.')
            else:
                # Choose a random index and try to generate indices
                # for the remaining samples
                index_i7 = random.choice(
                    self._indices[sample.index_type.pk]['i7'],
                )

                self._result.append(self._create_result_dict(
                    sample,
                    index_i7,
                    self._create_index_dict('', ''),  # Index I5
                ))

                self._update_indices(sample.index_type.pk, 'i7', index_i7)

    def _generate_index_i5(self, sample):
        """ Generate index I5 for a given sample. """
        index_i5 = {'avg_score': 100.0}

        for index in self._indices[sample.index_type.pk]['i5']:
            scores = self._calculate_scores_n(sample, index, 'index_i5', 8)

            # If indices are compatible
            if scores != -1:
                indices_in_result = [
                    res['index_i5']['index']
                    for res in self._result
                ]
                avg_score = sum(scores) / 8

                # Choose an index with a better average score
                # and make sure it's not in the result
                if avg_score < index_i5['avg_score'] \
                        and index['index'] not in indices_in_result:
                    index_i5 = {
                        'index': index,
                        'avg_score': avg_score
                    }

        # If an index has been generated
        if 'index' in index_i5.keys():
            for smpl in self._result:
                if smpl['name'] == sample.name:
                    smpl['index_i5'] = index_i5['index']
                    break
            self._update_indices(sample.index_type.pk, 'i5', index_i5['index'])

    def _add_libraries_to_result(self):
        """ Add all libraries directly to the result. """
        for library in self._libraries:
            # Get Index I7
            index_i7 = IndexI7.objects.filter(
                index=library.index_i7,
                index_type=library.index_type,
            )

            if index_i7:
                index_i7 = self._create_index_dict(index_i7[0].index,
                                                   index_i7[0].index_id)
            else:
                index_i7 = self._create_index_dict(library.index_i7, '')

            # Get Index I5
            index_i5 = IndexI5.objects.filter(
                index=library.index_i5,
                index_type=library.index_type,
            )

            if index_i5:
                index_i5 = self._create_index_dict(index_i5[0].index,
                                                   index_i5[0].index_id)
            else:
                idx_i5 = library.index_i5 if library.index_i5 else ''
                index_i5 = self._create_index_dict(idx_i5, '')

            self._result.append({
                'name': library.name,
                'library_id': library.pk,
                'read_length': library.read_length_id,
                'depth': library.sequencing_depth,
                'index_i7': index_i7,
                'index_i5': index_i5,
            })

            self._update_indices(library.index_type.pk, 'i7', index_i7)
            self._update_indices(library.index_type.pk, 'i5', index_i5)

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
            # except for the first two
            start = 2

        for i, sample in enumerate(self._samples[start:self._num_samples]):
            self._generate_index_i7(sample, i)
            if sample.index_type.is_index_i5:
                self._generate_index_i5(sample)

        return self.result
