from django.shortcuts import render
from django.http import HttpResponse
from researcher.models import Researcher

import json


def get_researchers(request):
    researchers = Researcher.objects.all()

    data = [{
                'researcherId': researcher.id,
                'firstName': researcher.first_name,
                'lastName': researcher.last_name,
                'telephone': researcher.telephone,
                'email': researcher.email,
                'pi': researcher.pi,
                'organization': researcher.organization,
                'costUnit': researcher.costunit,
            }
            for researcher in researchers]

    return HttpResponse(json.dumps({'data': sorted(data, key=lambda x: x['lastName'])}),
                        content_type='application/json')


def edit_researcher(request):
    error = str()

    researcher_id = int(request.POST.get('researcher_id', ''))
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
