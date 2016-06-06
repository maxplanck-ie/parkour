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
