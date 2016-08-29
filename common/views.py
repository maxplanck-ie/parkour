from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.conf import settings


@login_required
def index(request):
    user = request.user
    return render(request, 'index.html', {
        'DEBUG': settings.DEBUG,
        'USERNAME': '%s %s' % (user.first_name, user.last_name) if user.first_name else user.username
    })
