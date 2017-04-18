from django.db import models
from django.conf import settings
from library.models import Library
from sample.models import Sample


class Pool(models.Model):
    name = models.CharField('Name', max_length=100, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='User',
    )
    libraries = models.ManyToManyField(Library, related_name='pool', blank=True)
    samples = models.ManyToManyField(Sample, related_name='pool', blank=True)
    size = models.PositiveSmallIntegerField('Pool Size', default=0, blank=True)
    loaded = models.PositiveSmallIntegerField('Loaded', default=0, blank=True)
    file = models.FileField(upload_to='pools/%Y/%m/%d/', blank=True, null=True)

    def __str__(self):
        return self.name
