def move_other_to_end(data):
    """ Move 'Other' option to the end of the list. """
    result = []
    result.extend(data)

    other = [x for x in result if x['name'] == 'Other']
    if other:
        index = result.index(other[0])
        result.append(result.pop(index))

    return result
