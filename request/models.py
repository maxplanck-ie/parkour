from django.db import models
from researcher.models import Researcher
from library.models import Library, Sample


class Request(models.Model):
    status = models.IntegerField(null=True)
    name = models.CharField('Name', max_length=250)
    project_type = models.CharField('Project Type', max_length=100, null=True)
    date_created = models.DateField(null=True)
    description = models.TextField(null=True)
    researcher_id = models.ForeignKey(Researcher, null=True)
    terms_of_use_accept = models.BooleanField(default=True)
    libraries = models.ManyToManyField(Library, blank=True)
    samples = models.ManyToManyField(Sample, blank=True)

    def __str__(self):
        return '%s' % self.name
