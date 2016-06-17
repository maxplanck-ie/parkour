from django.shortcuts import render
from django.http import HttpResponse
from researcher.models import Researcher
from common.utils import *

import json


def get_researchers(request):
    """ Get the list of all researchers and send it to frontend """
    error = str()
    data = []

    try:
        researchers = Researcher.objects.all().prefetch_related(
            'pi', 'organization', 'costunit'
        )

        for researcher in researchers:
            cost_unit = []
            cost_unit_id = []
            for cu in researcher.costunit.all():
                cost_unit.append(cu.name)
                cost_unit_id.append(cu.id)

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
                'costUnit': ', '.join(sorted(cost_unit)),
                'costUnitId': cost_unit_id,
            })
    except Exception as e:
        print('[ERROR]: get_researchers():', e)
        error = str(e)

    return HttpResponse(json.dumps({'success': not error, 'error': error,
                                    'data': sorted(data, key=lambda x: x['lastName'])}),
                        content_type='application/json')


def add_researcher(request):
    """ Add new researcher """
    error = str()

    first_name = request.POST.get('first_name', '')
    last_name = request.POST.get('last_name', '')
    telephone = request.POST.get('telephone', '')
    email = request.POST.get('email', '')
    pi = request.POST.get('pi', '')
    organization = request.POST.get('organization', '')
    cost_unit = request.POST.get('cost_unit', '')

    try:
        researcher = Researcher(first_name=first_name, last_name=last_name, telephone=telephone,
                                email=email, pi=pi, organization=organization, costunit=cost_unit)
        researcher.save()
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
    pi = request.POST.get('pi', '')
    organization = request.POST.get('organization', '')
    cost_unit = request.POST.get('cost_unit', '')

    try:
        researcher = Researcher.objects.get(id=researcher_id)
        researcher.first_name = first_name
        researcher.last_name = last_name
        researcher.telephone = telephone
        researcher.email = email
        researcher.pi = pi
        researcher.organization = organization
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
