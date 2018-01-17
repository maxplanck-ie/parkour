from django.db import models

from common.utils import generate_barcode
from library_sample_shared.models import GenericLibrarySample, BarcodeCounter


class Library(GenericLibrarySample):
    mean_fragment_size = models.PositiveIntegerField(
        'Mean Fragment Size',
        null=True,
        blank=True,
    )

    qpcr_result = models.FloatField('qPCR Result', null=True, blank=True)

    # Quality Control
    qpcr_result_facility = models.FloatField(
        'qPCR Result (facility)',
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = 'Library'
        verbose_name_plural = 'Libraries'

    def save(self, *args, **kwargs):
        created = self.pk is None
        super().save(*args, **kwargs)

        if created:
            # Create barcode
            counter = BarcodeCounter.load()
            counter.increment()
            counter.save()

            self.barcode = generate_barcode('L', str(counter.counter))
            self.save(update_fields=['barcode'])
