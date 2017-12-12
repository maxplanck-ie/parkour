import itertools
from collections import Counter

from django.db.models import Q
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from request.models import Request


class InvoicingSerializer(ModelSerializer):
    request = SerializerMethodField()
    cost_unit = SerializerMethodField()
    sequencer = SerializerMethodField()
    flowcell = SerializerMethodField()
    pool = SerializerMethodField()
    percentage = SerializerMethodField()
    read_length = SerializerMethodField()
    num_libraries_samples = SerializerMethodField()
    library_protocol = SerializerMethodField()
    fixed_costs = SerializerMethodField()
    sequencing_costs = SerializerMethodField()
    preparation_costs = SerializerMethodField()
    variable_costs = SerializerMethodField()
    total_costs = SerializerMethodField()

    class Meta:
        model = Request
        fields = ('request', 'cost_unit', 'sequencer', 'flowcell', 'pool',
                  'percentage', 'read_length', 'num_libraries_samples',
                  'library_protocol', 'fixed_costs', 'sequencing_costs',
                  'preparation_costs', 'variable_costs', 'total_costs',)

    def get_request(self, obj):
        return obj.name

    def get_cost_unit(self, obj):
        return '; '.join(obj.user.cost_unit.values_list('name', flat=True))

    def get_sequencer(self, obj):
        flowcells = obj.flowcell.all()
        return '; '.join(
            flowcells.values_list('sequencer__name', flat=True))

    def get_flowcell(self, obj):
        flowcells = obj.flowcell.all()
        return '; '.join([
            '{} {}'.format(x.create_time.strftime('%d.%m.%Y'), x.flowcell_id)
            for x in flowcells
        ])

    def get_pool(self, obj):
        flowcells = obj.flowcell.all()
        return '; '.join(
            flowcells.values_list('lanes__pool__name', flat=True).distinct()
        )

    def get_percentage(self, obj):
        flowcells = obj.flowcell.all()

        per_sequencer = []
        for flowcell in flowcells:
            count = Counter(
                flowcell.lanes.values_list('pool__name', flat=True))
            per_pool = ', '.join(list(
                map(lambda x: f'1*{x}', list(count.values()))
            ))
            per_sequencer.append(per_pool)

        return '; '.join(per_sequencer)

    def get_read_length(self, obj):
        libraries = obj.libraries.all()
        samples = obj.samples.filter(~Q(status=-1))
        read_lengths = set(itertools.chain(
            libraries.values_list('read_length__name', flat=True).distinct(),
            samples.values_list('read_length__name', flat=True).distinct(),
        ))
        return ', '.join(read_lengths)

    def get_num_libraries_samples(self, obj):
        num_libraries = obj.libraries.count()
        num_samples = obj.samples.filter(~Q(status=-1)).count()
        if num_libraries > 0:
            return f'{num_libraries} libraries'
        else:
            return f'{num_samples} samples'

    def get_library_protocol(self, obj):
        library = obj.libraries.first()
        sample = obj.samples.first()
        item = library or sample
        return item.library_protocol.name

    def get_fixed_costs(self, obj):
        return ''

    def get_sequencing_costs(self, obj):
        return ''

    def get_preparation_costs(self, obj):
        return ''

    def get_variable_costs(self, obj):
        return ''

    def get_total_costs(self, obj):
        return ''
