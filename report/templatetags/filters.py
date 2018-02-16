from django.template.defaulttags import register


@register.filter
def get_count(dictionary, key):
    return dictionary.get(key, 0)
