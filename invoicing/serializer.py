import itertools
from collections import Counter

from django.db.models import Q
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from index_generator.models import Pool
from request.models import Request

from .models import FixedCosts, LibraryPreparationCosts, SequencingCosts


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
        pools = self._get_pools(obj)
        return '; '.join(pools.values_list('name', flat=True))

    def get_percentage(self, obj):
        flowcells = obj.flowcell.all()
        all_pools = self._get_pools(obj)

        per_sequencer = []
        for flowcell in flowcells:
            count = Counter(flowcell.lanes.values_list('pool', flat=True))

            per_pool = []
            for pool in all_pools.filter(pk__in=count.keys()):
                # Calculate Total Sequencing Depth for all pool's
                # libraries and samples
                p_libs = pool.libraries.filter(pool=pool)
                p_smpls = pool.samples.filter(pool=pool)
                total_depth = \
                    sum(p_libs.values_list('sequencing_depth', flat=True)) + \
                    sum(p_smpls.values_list('sequencing_depth', flat=True))

                # Calculate Sequencing Depth for all request's
                # libraries and samples
                libs = p_libs.filter(request=obj)
                smpls = p_smpls.filter(request=obj)
                depth = \
                    sum(libs.values_list('sequencing_depth', flat=True)) + \
                    sum(smpls.values_list('sequencing_depth', flat=True))

                percentage = round(depth / total_depth, 2)
                if percentage == 1.0:
                    percentage = 1

                per_pool.append(f'{percentage}*{count[pool.pk]}')
            per_sequencer.append(', '.join(per_pool))

        return '; '.join(per_sequencer)

    def get_read_length(self, obj):
        libraries = self._get_libraries(obj)
        samples = self._get_samples(obj)
        read_lengths = set(itertools.chain(
            libraries.values_list('read_length__name', flat=True),
            samples.values_list('read_length__name', flat=True),
        ))
        return ', '.join(read_lengths)

    def get_num_libraries_samples(self, obj):
        num_libraries = self._get_libraries(obj).count()
        num_samples = self._get_samples(obj).count()
        if num_libraries > 0:
            return f'{num_libraries} libraries'
        else:
            return f'{num_samples} samples'

    def get_library_protocol(self, obj):
        library = self._get_libraries(obj).first()
        sample = self._get_samples(obj).first()
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

    def _get_libraries(self, obj):
        return obj.libraries.filter(pool__isnull=False)

    def _get_samples(self, obj):
        return obj.samples.filter(~Q(pool=None) & ~Q(status=-1))

    def _get_pools(self, obj):
        libraries = self._get_libraries(obj)
        samples = self._get_samples(obj)
        pool_ids = set(itertools.chain(
            libraries.values_list('pool', flat=True),
            samples.values_list('pool', flat=True),
        ))
        return Pool.objects.filter(pk__in=pool_ids)


class BaseSerializer(ModelSerializer):
    name = SerializerMethodField()

    class Meta:
        fields = ('name',)

    def get_name(self, obj):
        return str(obj)


class FixedCostsSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = FixedCosts
        fields = ('id', 'sequencer', 'price',) + \
            BaseSerializer.Meta.fields
        extra_kwargs = {
            'sequencer': {'required': False},
        }


class LibraryPreparationCostsSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = LibraryPreparationCosts
        fields = ('id', 'library_protocol', 'price',) + \
            BaseSerializer.Meta.fields
        extra_kwargs = {
            'library_protocol': {'required': False},
        }


class SequencingCostsSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = SequencingCosts
        fields = ('id', 'sequencer', 'read_length', 'price',) +\
            BaseSerializer.Meta.fields
        extra_kwargs = {
            'sequencer': {'required': False},
            'read_length': {'required': False},
        }
