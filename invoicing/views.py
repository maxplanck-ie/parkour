import datetime
import calendar
import itertools
import numpy as np
from collections import OrderedDict
from dateutil.relativedelta import relativedelta

from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.db.models import Q, Prefetch, Min
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required

from rest_framework import mixins, viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework.permissions import IsAdminUser

from month import Month
from xlwt import Workbook, XFStyle, Formula

from common.views import CsrfExemptSessionAuthentication
from request.models import Request
from library.models import Library
from sample.models import Sample
from index_generator.models import Pool
from flowcell.models import Flowcell

from .models import (
    InvoicingReport,
    FixedCosts,
    LibraryPreparationCosts,
    SequencingCosts,
)
from .serializer import (
    InvoicingSerializer,
    FixedCostsSerializer,
    LibraryPreparationCostsSerializer,
    SequencingCostsSerializer,
)


class InvoicingViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAdminUser]
    serializer_class = InvoicingSerializer

    def get_queryset(self):
        today = datetime.date.today()
        year = self.request.query_params.get('year', today.year)
        month = self.request.query_params.get('month', today.month)

        flowcell_qs = Flowcell.objects.select_related(
            'sequencer').order_by('flowcell_id')
        libraries_qs = Library.objects.filter(~Q(pool=None)).only(
            'read_length', 'library_protocol',)
        samples_qs = Sample.objects.filter(~Q(pool=None) & ~Q(status=-1)).only(
            'read_length', 'library_protocol',)

        queryset = Request.objects.filter(
            flowcell__create_time__year=year,
            flowcell__create_time__month=month,
            sequenced=True,
        ).select_related('user').prefetch_related(
            Prefetch('flowcell', queryset=flowcell_qs),
            Prefetch('libraries', queryset=libraries_qs),
            Prefetch('samples', queryset=samples_qs),
        ).order_by('pk').distinct().annotate(
            sequencing_date=Min('flowcell__create_time')
        ).order_by('sequencing_date')

        return queryset

    # @print_sql_queries
    # def list(self, request, *args, **kwargs):
    #     return super().list(request, *args, **kwargs)

    @list_route(methods=['get'])
    def billing_periods(self, request):
        flowcells = Flowcell.objects.all()
        data = []

        if flowcells.count() == 0:
            return Response(data)

        start_date = flowcells.first().create_time
        end_date = flowcells.last().create_time
        end_date = end_date + relativedelta(months=1)

        dates = np.arange(start_date, end_date, dtype='datetime64[M]').tolist()
        for dt in dates:
            try:
                report = InvoicingReport.objects.get(
                    month=dt.strftime('%Y-%m'))
                report_url = settings.MEDIA_URL + report.report.name
            except InvoicingReport.DoesNotExist:
                report_url = ''
            data.append({
                'name': dt.strftime('%B %Y'),
                'value': [dt.year, dt.month],
                'report_url': report_url,
            })

        return Response(data)

    @list_route(methods=['post'])
    def upload(self, request):
        """ Upload Invoicing Report. """
        month = request.data.get('month', None)
        report = request.data.get('report', None)

        if not month or not report:
            return Response({
                'success': False,
                'error': 'Month or report is not set.',
            }, 400)

        try:
            report = InvoicingReport.objects.get(month=month)
            report.report = request.data.get('report')
        except InvoicingReport.DoesNotExist:
            report = InvoicingReport(
                month=Month.from_string(month),
                report=request.data.get('report')
            )
        finally:
            report.save()

        return JsonResponse({'success': True})


class FixedCostsViewSet(mixins.UpdateModelMixin,
                        viewsets.ReadOnlyModelViewSet):
    """ Get the list of Fixed Costs. """
    permission_classes = [IsAdminUser]
    queryset = FixedCosts.objects.all()
    serializer_class = FixedCostsSerializer


class LibraryPreparationCostsViewSet(mixins.UpdateModelMixin,
                                     viewsets.ReadOnlyModelViewSet):
    """ Get the list of Library Preparation Costs. """
    permission_classes = [IsAdminUser]
    queryset = LibraryPreparationCosts.objects.all()
    serializer_class = LibraryPreparationCostsSerializer


class SequencingCostsViewSet(mixins.UpdateModelMixin,
                             viewsets.ReadOnlyModelViewSet):
    """ Get the list of Sequencing Costs. """
    permission_classes = [IsAdminUser]
    queryset = SequencingCosts.objects.all()
    serializer_class = SequencingCostsSerializer


@login_required
@staff_member_required
def invoice(request):
    response = HttpResponse(content_type='application/ms-excel')
    response['Content-Disposition'] = 'attachment; ' +\
        'filename="Automated_Cost_calculation.xls"'

    today = datetime.date.today()
    year = today.year
    month = today.month

    # flowcells = Flowcell.objects.filter(
    #     create_time__year=year,
    #     create_time__month=month,
    # ).annotate(
    #     not_completed_lanes_count=Count(
    #         Case(When(~Q(lanes__completed=True), then=1))
    #     )
    # ).filter(
    #     not_completed_lanes_count__exact=0
    # ).order_by('create_time')
    flowcells = Flowcell.objects.filter(
        create_time__year=year,
        create_time__month=month,
    ).order_by('create_time')

    wb = Workbook(encoding='utf-8')

    font_style = XFStyle()
    font_style.alignment.wrap = 1
    font_style_bold = XFStyle()
    font_style_bold.font.bold = True

    # First sheet
    ws = wb.add_sheet('Costs')
    header = [
        'Date',                             # A
        'Request ID (ID_User_Group)',       # B
        'Cost Unit',                        # C
        '# of Libraries/Samples',           # D
        'Libraries/Samples',                # E
        '# of failed QC',                   # F
        'Effective Libraries/Samples',      # G
        'Library Preparation Protocol',     # H
        'Pool ID',                          # I
        '% in Pool',                        # J
        'FC ID Parkour',                    # K
        'FC ID Sequencer',                  # L
        'Sequencer',                        # M
        '# of Lanes',                       # N
        'Effective Lanes',                  # O
        'Read Length',                      # P
        'Link: Sequencer + Reads',          # Q
        'Fixed Costs',                      # R
        'Variable Costs Library',           # S
        'Variable Costs Sequencing',        # T
        'Total Costs',                      # U
    ]

    fixed_costs_prices = OrderedDict({
        'MiSeq': 22.00,
        'NextSeq MID': 620.00,
        'NextSeq HIGH': 620.00,
        'HiSeq2500': 340.00,
        'HiSeq3000': 340.00,
    })

    lib_prep_reagents_prices = OrderedDict({
        'NEBNext® Ultra™ II DNA Library Prep Kit for Illumina': 55.16,
        'TruSeq® Stranded mRNA': 79.39,
        'TruSeq® Stranded Total RNA (Gold)': 139.53,
        'SMART - Seq v4 Ultra Low Input RNA': 186.50,
        'TruSeq® Small RNA Sample Prep': 112.51,
        'NEBNext® Ultra™RNA Library Prep (mRNA)': 79.39,
        'NEBNext® Ultra™RNA Library Prep (total RNA)': 139.53,
        'TruSeq® DNA PCR - Free Sample Preparation': 53.88,
        'TruSeq® DNA Methylation Kit': 151.14,
        'Libraries prepared by user': 5.26,
    })

    sequencing_prices = OrderedDict({
        'MiSeq 2x150': 975.28,
        'MiSeq 2x300': 1469.78,
        'NextSeq MID 2x75': 989.97,
        'NextSeq MID 2x150': 1585.32,
        'NextSeq HIGH 2x75': 2544.94,
        'NextSeq HIGH 2x150': 4072.49,
        'HiSeq 2500 2x50': 1278.59,
        'HiSeq2500 2x75': 1554.72,
        'HiSeq2500 2x100': 1729.88,
        'HiSeq3000 2x75': 1422.88,
        'HiSeq3000 2x150': 1990.10,
        'HiSeq Rapid 2x250': 5441.41,
    })

    ws.write(0, 0, 'Invoice', font_style_bold)
    ws.write(1, 0, 'Completed Requests, Completed=Sequencing done',
             font_style_bold)
    ws.write(2, 0, 'Month', font_style_bold)
    ws.write(2, 1, calendar.month_name[month], font_style_bold)
    ws.write(3, 0, 'Days', font_style_bold)
    ws.write(3, 1, 'Day 1-{}'.format(calendar.monthrange(year, month)[1]),
             font_style_bold)

    # Fixed Costs Sequencing table
    fixed_costs_table_row_num = 8 + flowcells.count() * 2
    row_num = fixed_costs_table_row_num
    ws.write(row_num, 0, 'Fixed Costs Sequencing', font_style_bold)
    ws.write(row_num, 1, 'Price', font_style_bold)
    for i, (sequencer, price) in enumerate(fixed_costs_prices.items()):
        row_num += 1
        ws.write(row_num, 0, sequencer, font_style)
        ws.write(row_num, 1, price, font_style)

    # Library Preparation Reagents Costs table
    lib_prep_table_row_num = fixed_costs_table_row_num + \
        len(fixed_costs_prices) + 3
    row_num = lib_prep_table_row_num
    ws.write(row_num, 0, 'Costs for Library Prep Reagents', font_style_bold)
    ws.write(row_num, 1, 'Price', font_style_bold)
    for i, (protocol, price) in enumerate(lib_prep_reagents_prices.items()):
        row_num += 1
        ws.write(row_num, 0, protocol, font_style)
        ws.write(row_num, 1, price, font_style)

    # Sequencing Costs table
    sequencing_costs_table_row_num = lib_prep_table_row_num + \
        len(lib_prep_reagents_prices) + 3
    row_num = sequencing_costs_table_row_num
    ws.write(row_num, 0, 'Costs for Sequencing', font_style_bold)
    ws.write(row_num, 1, 'Price', font_style_bold)
    for i, (link, price) in enumerate(sequencing_prices.items()):
        row_num += 1
        ws.write(row_num, 0, link, font_style)
        ws.write(row_num, 1, price, font_style)

    row_num = 5
    for i, column in enumerate(header):
        ws.write(row_num, i, column, font_style_bold)
        ws.col(i).width = 8000

    # Main table
    for flowcell in flowcells:
        lanes = flowcell.lanes.all()
        pool = Pool.objects.filter(
            pk__in=lanes.values_list('pool', flat=True).distinct()
        ).order_by('pk')[0]
        # pool_ids = ', '.join(pools.values_list('name', flat=True))

        libraries = Library.objects.filter(pool=pool)
        samples = Sample.objects.filter(pool=pool)
        total_sequencing_depth = \
            sum(libraries.filter(~Q(status=-1)).values_list(
                'sequencing_depth', flat=True)) + \
            sum(samples.filter(~Q(status=-1)).values_list(
                'sequencing_depth', flat=True))

        requests = Request.objects.filter(pk__in=set(itertools.chain(
            libraries.values_list('request', flat=True).distinct(),
            samples.values_list('request', flat=True).distinct()
        ))).distinct().order_by('create_time')

        for req in requests:
            row_num += 1
            row_idx = str(row_num + 1)

            cost_units = ', '.join(
                req.user.cost_unit.values_list('name', flat=True))

            request_libraries = libraries.filter(request=req)
            request_samples = samples.filter(request=req)
            libraries_cnt = request_libraries.count()
            samples_cnt = request_samples.count()
            failed_libraries_cnt = request_libraries.filter(status=-1).count()
            failed_samples_cnt = request_samples.filter(status=-1).count()
            libraries_and_samples = []
            if libraries_cnt > 0:
                libraries_and_samples.append('Libraries')
            if samples_cnt > 0:
                libraries_and_samples.append('Samples')

            passed_libraries = request_libraries.filter(~Q(status=-1))
            passed_samples = request_samples.filter(~Q(status=-1))
            passed_lib_depths_sum = sum(passed_libraries.values_list(
                'sequencing_depth', flat=True))
            passed_smpl_depths_sum = sum(passed_samples.values_list(
                'sequencing_depth', flat=True))

            pool_percentage = \
                round((passed_lib_depths_sum + passed_smpl_depths_sum) /
                      total_sequencing_depth * 100)

            record = request_libraries.first() or request_samples.first()
            seq_reads_link = f'{flowcell.sequencer.name} {record.read_length.name}'

            formula = f'D{row_idx}-F{row_idx}'
            effective_libraries_samples = Formula(formula)

            formula = f'N{row_idx}*J{row_idx}/100'
            effective_lanes = Formula(formula)

            # formula = 'O{}*VLOOKUP(M{};A{}:B{};2)'.format(
            #     row_idx, row_idx,
            #     9 + 1 + flowcells.count(),
            #     9 + flowcells.count() + len(fixed_costs_prices),
            # )
            # try:
            #     formula = 'O{}*$B${}'.format(
            #         row_idx,
            #         fixed_costs_table_row_num + 2 +
            #         list(fixed_costs_prices.keys()).index(flowcell.sequencer.name),
            #     )
            #     fixed_costs = Formula(formula)
            # except ValueError:
            #     fixed_costs = ''
            fixed_costs = ''

            # try:
            #     formula = 'O{}*$B${}'.format(
            #         row_idx,
            #         sequencing_costs_table_row_num + 2 +
            #         list(sequencing_prices.keys()).index(seq_reads_link)
            #     )
            #     var_costs_sequencing = Formula(formula)
            # except ValueError:
            #     var_costs_sequencing = ''
            var_costs_sequencing = ''

            formula = f'S{row_idx}+T{row_idx}+R{row_idx}'
            total_costs = Formula(formula)

            row = [
                # flowcell.flowcell_id,
                flowcell.create_time.strftime('%d.%m.%Y'),
                req.name,
                cost_units,
                libraries_cnt + samples_cnt,
                ' and '.join(libraries_and_samples),
                failed_libraries_cnt + failed_samples_cnt,
                effective_libraries_samples,
                record.library_protocol.name,
                pool.name,
                pool_percentage,
                '{} ({})'.format(flowcell.flowcell_id,
                                 flowcell.create_time.strftime('%d.%m.%Y')),
                '',
                flowcell.sequencer.name,
                flowcell.lanes.count(),
                effective_lanes,
                record.read_length.name,
                seq_reads_link,
                fixed_costs,
                '',
                var_costs_sequencing,
                total_costs,
            ]

            for i in range(len(row)):
                ws.write(row_num, i, row[i], font_style)

    wb.save(response)
    return response
