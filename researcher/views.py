from django.shortcuts import render
from django.http import HttpResponse
from researcher.models import Researcher, PrincipalInvestigator, Organization, CostUnit
from common.utils import *

import json


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
                'telephone': researcher.telephone,
                'email': researcher.email,
                'pi': researcher.pi.name,
                'piId': researcher.pi_id,
                'organization': researcher.organization.name,
                'organizationId': researcher.organization_id,
                'costUnit': ', '.join(sorted(cost_units)),
                'costUnitId': cost_units_id,
            })
    except Exception as e:
        print('[ERROR]: get_researchers():', e)
        error = str(e)

    return HttpResponse(json.dumps({'success': not error, 'error': error,
                                    'data': sorted(data, key=lambda x: x['lastName'].lower())}),
                        content_type='application/json')


def add_researcher(request):
    """ Add new researcher """
    error = str()

    first_name = request.POST.get('first_name', '')
    last_name = request.POST.get('last_name', '')
    telephone = request.POST.get('telephone', '')
    email = request.POST.get('email', '')
    pi_id = int(request.POST.get('pi', 0))
    organization_id = int(request.POST.get('organization', 0))
    cost_unit = json.loads(request.POST.get('cost_unit', '[]'))

    try:
        pi = PrincipalInvestigator.objects.get(id=pi_id)
        organization = Organization.objects.get(id=organization_id)
        researcher = Researcher(first_name=first_name, last_name=last_name, telephone=telephone,
                                email=email, pi=pi, organization=organization)
        researcher.save()
        researcher.cost_unit.add(*cost_unit)
    except Exception as e:
        print('[ERROR]: add_researcher():', e)
        error = str(e)

    return HttpResponse(json.dumps({'success': not error, 'error': error}), content_type='application/json')


def edit_researcher(request):
    """ Edit existing researcher """
    error = str()

    researcher_id = int(request.POST.get('researcher_id', 1))
    first_name = request.POST.get('first_name', '')
    last_name = request.POST.get('last_name', '')
    telephone = request.POST.get('telephone', '')
    email = request.POST.get('email', '')
    pi_id = int(request.POST.get('pi', 0))
    organization_id = int(request.POST.get('organization', 0))
    cost_unit = json.loads(request.POST.get('cost_unit', '[]'))

    try:
        researcher = Researcher.objects.get(id=researcher_id)
        researcher.first_name = first_name
        researcher.last_name = last_name
        researcher.telephone = telephone
        researcher.email = email
        researcher.pi = PrincipalInvestigator.objects.get(id=pi_id)
        researcher.organization = Organization.objects.get(id=organization_id)
        researcher.cost_unit = cost_unit
        researcher.save()
    except Exception as e:
        print('[ERROR]: edit_researcher():', e)
        error = str(e)

    return HttpResponse(json.dumps({'success': not error, 'error': error}), content_type='application/json')


def delete_researcher(request):
    error = str()

    researcher_id = int(request.POST.get('researcher_id', 0))

    try:
        researcher = Researcher.objects.get(id=researcher_id)
        researcher.delete()
    except Exception as e:
        print('[ERROR]: delete_researcher():', e)
        error = str(e)

    return HttpResponse(json.dumps({'success': not error, 'error': error}), content_type='application/json')


def get_pis(request):
    """ Get the list of all principal investigators """
    error = str()
    data = []

    try:
        data = [{'name': pi.name, 'piId': pi.id} for pi in PrincipalInvestigator.objects.all()]
    except Exception as e:
        print('[ERROR]: get_pis():', e)
        error = str(e)

    return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                        content_type='application/json')


def get_organizations(request):
    """ Get the list of all organizations """
    error = str()
    data = []

    try:
        data = [{'name': organization.name, 'organizationId': organization.id}
                for organization in Organization.objects.all()]
    except Exception as e:
        print('[ERROR]: get_organizations():', e)
        error = str(e)

    return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                        content_type='application/json')


def get_cost_units(request):
    """ Get the list of all cost units """
    error = str()
    data = []

    try:
        data = [{'name': cost_unit.name, 'costUnitId': cost_unit.id}
                for cost_unit in CostUnit.objects.all()]
    except Exception as e:
        print('[ERROR]: get_cost_units():', e)
        error = str(e)

    return HttpResponse(json.dumps({'success': not error, 'error': error, 'data': data}),
                        content_type='application/json')
