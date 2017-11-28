# import datetime
import calendar

from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required

from xlwt import Workbook, XFStyle, Formula

from library.models import Library
from sample.models import Sample
from index_generator.models import Pool
from flowcell.models import Flowcell


@login_required
@staff_member_required
def invoice(request):
    response = HttpResponse(content_type='application/ms-excel')
    response['Content-Disposition'] = 'attachment; ' +\
        'filename="Automated_Cost_calculation.xls"'

    # today = datetime.date.today()
    # year = today.year
    # month = today.month
    year = 2017
    month = 11
    flowcells = Flowcell.objects.filter(
        create_time__year=year,
        create_time__month=month,
        lanes__completed=True,
    ).distinct()

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

    ws.write(0, 0, 'Invoice', font_style_bold)
    ws.write(1, 0, 'Completed Requests, Completed=Sequencing done',
             font_style_bold)
    ws.write(2, 0, 'Month', font_style_bold)
    ws.write(2, 1, calendar.month_name[month], font_style_bold)
    ws.write(3, 0, 'Days', font_style_bold)
    ws.write(3, 1, 'Day 1-{}'.format(calendar.monthrange(year, month)[1]),
             font_style_bold)

    row_num = 5

    for i, column in enumerate(header):
        ws.write(row_num, i, column, font_style_bold)
        ws.col(i).width = 8000

    for flowcell in flowcells:
        row_num += 1
        row_idx = str(row_num + 1)

        lanes = flowcell.lanes.all()
        pools = Pool.objects.filter(
            pk__in=lanes.values_list('pool', flat=True).distinct()
        ).order_by('pk')
        pool_ids = ', '.join(pools.values_list('name', flat=True))

        record = pools[0].libraries.first() or pools[0].samples.first()
        request = record.request.get()
        cost_units = ', '.join(
            request.user.cost_unit.values_list('name', flat=True))

        libraries = Library.objects.filter(pool__in=pools)
        samples = Sample.objects.filter(pool__in=pools)
        libraries_cnt = libraries.count()
        samples_cnt = samples.count()
        failed_libraries_cnt = libraries.filter(status=-1).count()
        failed_samples_cnt = samples.filter(status=-1).count()

        formula = f'D{row_idx}-F{row_idx}'
        effective_libraries_samples = Formula(formula)

        formula = f'N{row_idx}*J{row_idx}/100'
        effective_lanes = Formula(formula)

        formula = f'S{row_idx}+T{row_idx}+R{row_idx}'
        total_costs = Formula(formula)

        row = [
            flowcell.flowcell_id,
            request.name,
            cost_units,
            libraries_cnt + samples_cnt,
            f'# of Libraries: {libraries_cnt}, # of Samples: {samples_cnt}',
            failed_libraries_cnt + failed_samples_cnt,
            effective_libraries_samples,
            record.library_protocol.name,
            pool_ids,
            '',
            '{} ({})'.format(flowcell.flowcell_id,
                             flowcell.create_time.strftime('%d.%m.%Y')),
            '',
            flowcell.sequencer.name,
            flowcell.lanes.count(),
            effective_lanes,
            record.read_length.name,
            '',
            '',
            '',
            '',
            total_costs,
        ]

        for i in range(len(row)):
            ws.write(row_num, i, row[i], font_style)

    wb.save(response)
    return response
