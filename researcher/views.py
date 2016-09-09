from django.http import HttpResponse
from researcher.models import Researcher, PrincipalInvestigator, \
    Organization, CostUnit, ResearcherForm
# from common.utils import *

import json
import logging

logger = logging.getLogger('db')


def get_researchers(request):
    """ Get the list of all researchers """
    error = str()
    data = []

    try:
        researchers = Researcher.objects.all().prefetch_related(
            'pi', 'organization', 'cost_unit'
        )

        for researcher in researchers:
            cost_units = []
            cost_units_id = []
            for cost_unit in researcher.cost_unit.all():
                cost_units.append(cost_unit.name)
                cost_units_id.append(cost_unit.id)

            data.append({
                'researcherId': researcher.id,
                'firstName': researcher.first_name,
                'lastName': researcher.last_name,
                'phone': researcher.phone,
                'email': researcher.email,
                'pi': researcher.pi.name,
                'piId': researcher.pi_id,
                'organization': researcher.organization.name,
                'organizationId': researcher.organization_id,
                'costUnit': ', '.join(sorted(cost_units)),
                'costUnitId': cost_units_id,
            })
    except Exception as e:
        error = str(e)
        print('[ERROR]: get_researchers/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': sorted(data, key=lambda x: x['lastName'].lower()),
        }),
        content_type='application/json',
    )


def save_researcher(request):
    error = str()

    if request.method == 'POST':
        mode = request.POST.get('mode')
        cost_unit = json.loads(request.POST.get('cost_unit'))

        try:
            if mode == 'add':
                form = ResearcherForm(request.POST)
            else:
                researcher_id = request.POST.get('researcher_id')
                researcher = Researcher.objects.get(id=researcher_id)
                form = ResearcherForm(request.POST, instance=researcher)

            if form.is_valid():
                researcher = form.save()
                researcher.cost_unit.add(*cost_unit)
            else:
                error = 'Form is invalid'
                print('[ERROR]: save_researcher/: %s' % form.errors.as_data())
                logger.debug(form.errors.as_data())     

        except Exception as e:
            error = str(e)
            print('[ERROR]: save_researcher/: %s' % error)
            logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )


def delete_researcher(request):
    error = str()

    try:
        researcher_id = request.POST.get('researcher_id')
        researcher = Researcher.objects.get(id=researcher_id)
        researcher.delete()

    except Exception as e:
        error = str(e)
        print('[ERROR]: delete_researcher/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )


def get_organizations(request):
    """ Get the list of all organizations """
    error = str()
    data = []

    try:
        data = [
            {
                'name': organization.name,
                'organizationId': organization.id,
            }
            for organization in Organization.objects.all()
        ]
        data = sorted(data, key=lambda x: x['name'])

    except Exception as e:
        error = str(e)
        print('[ERROR]: get_organizations/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data,
        }),
        content_type='application/json',
    )


def get_pis(request):
    """ Get the list of all principal investigators by a given organization id """
    error = str()
    data = []

    try:
        organization_id = request.GET.get('organization_id')
        pis = PrincipalInvestigator.objects.filter(
            organization=organization_id
        )
        data = [
            {
                'name': pi.name,
                'piId': pi.id,
            }
            for pi in pis
        ]
        data = sorted(data, key=lambda x: x['name'])

    except Exception as e:
        error = str(e)
        print('[ERROR]: get_pis/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data,
        }),
        content_type='application/json',
    )


def get_cost_units(request):
    """ Get the list of all cost units """
    error = str()
    data = []

    try:
        pi_id = request.GET.get('pi_id')
        data = [
            {
                'name': cost_unit.name,
                'costUnitId': cost_unit.id,
            }
            for cost_unit in CostUnit.objects.filter(pi=pi_id)
        ]
        data = sorted(data, key=lambda x: x['name'])

    except Exception as e:
        error = str(e)
        print('[ERROR]: get_cost_units/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
            'data': data,
        }),
        content_type='application/json',
    )


def add_researcher_field(request):
    """ Add new Organization, Principal Investigator or Cost Unit """
    error = str()

    try:
        mode = request.POST.get('mode', '')
        name = request.POST.get('name', '')
        organization_id = request.POST.get('organization_id')
        organization_id = int(organization_id) if organization_id != '' else 0
        pi_id = request.POST.get('pi_id')
        pi_id = int(pi_id) if pi_id != '' else 0

        if mode == 'organization':
            organization = Organization(name=name)
            organization.save()
        elif mode == 'pi':
            organization = Organization.objects.get(id=organization_id)
            pi = PrincipalInvestigator(name=name, organization=organization)
            pi.save()
        elif mode == 'cost_unit':
            pi = PrincipalInvestigator.objects.get(id=pi_id)
            cost_unit = CostUnit(name=name, pi=pi)
            cost_unit.save()
        else:
            raise ValueError('Wrong mode (field)')

    except Exception as e:
        error = str(e)
        print('[ERROR]: add_researcher_field/: %s' % error)
        logger.debug(error)

    return HttpResponse(
        json.dumps({
            'success': not error,
            'error': error,
        }),
        content_type='application/json',
    )
