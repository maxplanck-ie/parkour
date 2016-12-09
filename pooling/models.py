from django.db import models
from library.models import Library
from sample.models import Sample


class Pooling(models.Model):
    library = models.ForeignKey(
        Library,
        verbose_name='Library',
        null=True,
        blank=True
    )

    sample = models.ForeignKey(
        Sample,
        verbose_name='Sample',
        null=True,
        blank=True
    )

    concentration_c1 = models.FloatField(
        'Concentration C1',
        null=True,
        blank=True
    )

    concentration_c2 = models.FloatField(
        'Concentration C2',
        null=True,
        blank=True
    )

    sample_volume = models.FloatField(
        'Sample Volume V1',
        null=True,
        blank=True
    )

    buffer_volume = models.FloatField(
        'Buffer Volume V2',
        null=True,
        blank=True
    )

    percentage_library = models.PositiveSmallIntegerField(
        '% library in Pool',
        null=True,
        blank=True,
    )

    volume_to_pool = models.FloatField(
        'Volume to Pool',
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = 'Pooling'
        verbose_name_plural = 'Pooling'

    def __str__(self):
        return self.library.name if self.library else self.sample.name
