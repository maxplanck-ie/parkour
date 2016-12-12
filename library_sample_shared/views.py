from django.views.generic.list import ListView

from common.utils import JSONResponseMixin


class SimpleStoreView(JSONResponseMixin, ListView):
    """
    Base class for simple Ext JS stores (with "id" and "name" only).
    """
    def render_to_response(self, context, **response_kwargs):
        response_kwargs['safe'] = False
        data = [
            {
                'id': obj.id,
                'name': obj.name
            }
            for obj in context.pop('object_list')
        ]

        return self.render_to_json_response(data, **response_kwargs)


class IndexStoreView(JSONResponseMixin, ListView):
    """
    Base class for IndexI7/IndexI5 stores.
    """
    def render_to_response(self, context, **response_kwargs):
        response_kwargs['safe'] = False

        index_type = int(self.request.GET.get('index_type_id'))
        all_indices = context.pop('object_list')
        indices = all_indices.filter(index_type=index_type)

        data = [
            {
                'id': index.id,
                'name': '%s - %s' % (index.index_id, index.index),
                'index': index.index,
            }
            for index in indices
        ]
        data = sorted(data, key=lambda x: x['id'])
        return self.render_to_json_response(data, **response_kwargs)
