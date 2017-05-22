from django.db import models
from django.conf import settings
from library.models import Library
from sample.models import Sample


class PoolSize(models.Model):
    multiplier = models.PositiveSmallIntegerField('Multiplier', default=1)
    size = models.PositiveSmallIntegerField('Size')

    def __str__(self):
        return '%ix%i' % (self.multiplier, self.size)


class Pool(models.Model):
    name = models.CharField('Name', max_length=100, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name='User')
    size = models.ForeignKey(PoolSize, verbose_name='Size')

    libraries = models.ManyToManyField(Library, related_name='pool',
                                       blank=True)
    samples = models.ManyToManyField(Sample, related_name='pool', blank=True)
    loaded = models.PositiveSmallIntegerField('Loaded', default=0, blank=True)

    def get_size(self):
        size = 0
        for library in self.libraries.all():
            size += library.sequencing_depth
        for sample in self.samples.all():
            size += sample.sequencing_depth
        return size

    def __str__(self):
        return self.name
