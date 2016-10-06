from django.db import models
from django.forms import ModelForm
# from researcher.models import Researcher
from library.models import Library, Sample


class Request(models.Model):
    status = models.IntegerField(default=0, blank=True, null=True)
    name = models.CharField('Name', max_length=100, blank=True)
    date_created = models.DateTimeField('Date', auto_now_add=True)
    description = models.TextField(null=True)
    # researcher_id = models.ForeignKey(Researcher, null=True)
    libraries = models.ManyToManyField(Library, blank=True)
    samples = models.ManyToManyField(Sample, blank=True)

    def __str__(self):
        return '%s' % self.name


class RequestForm(ModelForm):
    class Meta:
        model = Request
        exclude = ('date_created', 'libraries', 'samples',)
