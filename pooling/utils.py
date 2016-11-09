from library.models import Library, Sample, IndexI7, IndexI5

import re
import random


def convert_index(index):
    """ Convert A/C into R (red) and T into G (green). """
    return re.sub('T', 'G', re.sub('A|C', 'R', index))


def calculate_scores_pair(index1, index2, depth1, depth2):
    """
    Calculate the score for two given indices.

    Score is an absolute difference between Sequence Depth of
    the two indices divided by the total Sequence Depth (in %).

    The ideal score is 0.0 (50% green and 50% red),
    an acceptable score is 60.0 (80%/20% or 20%/80%).

    If the score is > 60%, then the indices are not compatible.
    """
    index1 = convert_index(index1)
    index2 = convert_index(index2)
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


def calculate_scores_n(records_in_result, current_record, current_index):
    """
    Calculate score for N given libraries/samples.

    The scoring principle is the same as in calculate_scores_pair(),
    but for N libraries and samples.
    """
    result = []

    # Calculate color distribution for libraries
    # which are already in the result
    color_distribution = [{'G': 0, 'R': 0} for _ in range(6)]
    total_depth = 0
    for record in records_in_result:
        for cycle in range(6):
            index = convert_index(record['predicted_index_i7']['index'])
            color = index[cycle]
            color_distribution[cycle][color] += record['depth']
        total_depth += record['depth']
    total_depth += current_record.sequencing_depth

    # Calculate scores for the libraries in the result with a new library
    for cycle in range(6):
        index = convert_index(current_index['index'])
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


def create_result_dict(sample, index_i7, index_i5):
    """ Create a dictionary with a sample and its indices. """
    return {
        'name': sample.name,
        'sample_id': sample.id,
        'read_length': sample.sequencing_run_condition_id,
        'depth': sample.sequencing_depth,
        'predicted_index_i7': index_i7,
        'predicted_index_i5': index_i5
    }


def create_index_dict(index, index_id):
    """ Create a dictionary with an index and its id. """
    return {
        'index': index,
        'index_id': index_id
    }


def generate(library_ids, sample_ids):
    """
    Generate indices for given libraries/samples, checking their compatibility
    and maximizing color diversity (distribution between G/T and A/C).
    """
    result = []

    libraries = Library.objects.filter(id__in=library_ids)
    samples = Sample.objects.filter(id__in=sample_ids)

    # Sort libraries and samples in descending order
    libraries = sorted(libraries,
                       key=lambda x: x.sequencing_depth, reverse=True)
    samples = sorted(samples, key=lambda x: x.sequencing_depth, reverse=True)

    # Index types for all libraries and samples
    index_types = list(set(
        [l.index_type for l in libraries] + [s.index_type for s in samples]
    ))

    # Get indices lists for each index type
    indices = {}
    for index_type in index_types:
        indices[index_type.id] = {'i7': [], 'i5': []}

        # Index I7
        if index_type.is_index_i7:
            indices[index_type.id]['i7'].extend([
                create_index_dict(index.index, index.index_id)
                for index in IndexI7.objects.filter(index_type=index_type.id)
            ])

        # Index I5
        if index_type.is_index_i5:
            indices[index_type.id]['i5'].extend([
                create_index_dict(index.index, index.index_id)
                for index in IndexI5.objects.filter(index_type=index_type.id)
            ])

    # If there are libraries, automatically add them to the result
    if any(libraries):
        case = 1
        for library in libraries:
            # Get Index I7
            index_i7_index = library.index_i7
            index_i7 = IndexI7.objects.filter(
                index=index_i7_index,
                index_type=library.index_type
            )
            index_i7_id = index_i7[0].index_id if index_i7 else ''

            # Get Index I5
            index_i5_index = library.index_i5
            index_i5 = IndexI5.objects.filter(
                index=library.index_i5,
                index_type=library.index_type
            )
            index_i5_id = index_i5[0].index_id if index_i5 else ''

            predicted_index_i7 = create_index_dict(index_i7_index, index_i7_id)
            predicted_index_i5 = create_index_dict(index_i5_index, index_i5_id)

            result.append({
                'name': library.name,
                'library_id': library.id,
                'read_length': library.sequencing_run_condition_id,
                'depth': library.sequencing_depth,
                'predicted_index_i7': predicted_index_i7,
                'predicted_index_i5': predicted_index_i5
            })

            try:
                # indices.pop(indices.index(predicted_index_i7))

                # Remove index i7 from the list of indices
                indices[library.index_type.id]['i7'].pop(
                    indices[library.index_type.id]['i7'].index(
                        predicted_index_i7
                    )
                )
            except ValueError:
                pass

            try:
                # indices.pop(indices.index(result[0]['predicted_index_i5']))

                # Remove index i5 from the list of indices
                indices[library.index_type.id]['i5'].pop(
                    indices[library.index_type.id]['i5'].index(
                        predicted_index_i5
                    )
                )
            except ValueError:
                pass

    # If generating indices only for samples
    else:
        case = 2
        # Find indices with the best scores for the
        # first two samples libraries
        best_pair = {'avg_score': 100.0}
        for index1 in indices[samples[0].index_type.id]['i7']:
            for index2 in indices[samples[1].index_type.id]['i7']:
                if index1 != index2:
                    scores = calculate_scores_pair(
                        index1['index'],
                        index2['index'],
                        samples[0].sequencing_depth,
                        samples[1].sequencing_depth
                    )

                    # If both indices are compatible
                    if scores != -1:
                        avg_score = sum(scores) / 6
                        if avg_score < best_pair['avg_score']:
                            best_pair = {
                                'index1': index1,
                                'index2': index2,
                                'avg_score': avg_score
                            }

        if 'index1' in best_pair.keys():
            result = [
                create_result_dict(
                    samples[0],
                    best_pair['index1'],
                    create_index_dict('', '')  # Index I5
                ),
                create_result_dict(
                    samples[1],
                    best_pair['index2'],
                    create_index_dict('', '')  # Index I5
                )
            ]

            # Delete two most matching indices from the list of indices
            indices[samples[0].index_type.id]['i7'].pop(
                indices[samples[0].index_type.id]['i7'].index(
                    best_pair['index1']
                )
            )
            indices[samples[1].index_type.id]['i7'].pop(
                indices[samples[1].index_type.id]['i7'].index(
                    best_pair['index2'])
            )
        else:
            # If a pair of two the most compatible indices was not found
            raise Exception('Could not generate indices for '
                            'the given Libraries/Samples.')

    if case == 1:
        # If there are any libraries, consider all samples
        start = 0
    else:
        # case 2: generate indices for all samples, except for the first two
        start = 2

    # Generate indices for the remaining samples
    num_samples = len(samples)
    for i, sample in enumerate(samples[start:num_samples]):
        predicted_index_i7 = {'avg_score': 100.0}

        # for index in indices:
        for index in indices[sample.index_type.id]['i7']:
            scores = calculate_scores_n(result, sample, index)

            # If indices are compatible
            if scores != -1:
                indices_in_result = [
                    r['predicted_index_i7']['index']
                    for r in result
                ]
                avg_score = sum(scores) / 6

                # Choose an index with a better average score
                # and make sure it's not in the result
                if avg_score < predicted_index_i7['avg_score'] \
                        and index['index'] not in indices_in_result:

                    predicted_index_i7 = {
                        'index': index,
                        'avg_score': avg_score
                    }

                    indices[sample.index_type.id]['i7'].pop(
                        indices[sample.index_type.id]['i7'].index(index)
                    )

        if 'index' in predicted_index_i7.keys():
            result.append(create_result_dict(
                sample,
                predicted_index_i7['index'],
                create_index_dict('', '')  # Index I5
            ))

        else:
            if i + 1 == num_samples:
                # Given libraries, if an index cannot be found
                # for the last sample, raise an exception
                raise Exception('Could not generate indices for '
                                'the given Libraries/Samples.')
            else:
                # Choose a random index and try to generate indices
                # for the remaining samples
                index_i7 = random.choice(indices[sample.index_type.id]['i7'])

                result.append(create_result_dict(
                    sample,
                    index_i7,
                    create_index_dict('', '')  # Index I5
                ))

                indices[sample.index_type.id]['i7'].pop(
                    indices[sample.index_type.id]['i7'].index(index_i7)
                )

    return result
