from django.db import models

from researcher.models import Researcher


class Request(models.Model):
    status = models.IntegerField()
    name = models.CharField('Name', max_length=250)
    project_type = models.CharField('Project Type', max_length=100)
    date_created = models.DateField()
    description = models.TextField()
    researcher_id = models.ForeignKey(Researcher)
    # sample_id = models.ForeignKey(Sample)
    terms_of_use_accept = models.BooleanField()

    def __str__(self):
        return '%s' % self.name
