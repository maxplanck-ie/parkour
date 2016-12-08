from django.db import models
from library.models import Library, Sample


class PoolFile(models.Model):
    file = models.FileField(upload_to='pools/%Y/%m/%d/')

    def __str__(self):
        return self.file.name.split('/')[-1]


class Pool(models.Model):
    name = models.CharField('Name', max_length=200)
    libraries = models.ManyToManyField(Library, blank=True)
    samples = models.ManyToManyField(Sample, blank=True)
    size = models.PositiveIntegerField('Pool Size', default=0, blank=True)

    file = models.ForeignKey(
        PoolFile,
        verbose_name='File',
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.name
