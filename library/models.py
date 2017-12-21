import string
import random

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

    @classmethod
    def get_test_library(cls, name=None):
        if not name:
            name = 'Library_' + ''.join(
                random.SystemRandom().choice(
                    string.ascii_lowercase + string.digits
                ) for _ in range(8)
            )

        return cls(
            name=name,
            organism_id=1,
            concentration=1.0,
            concentration_method_id=1,
            read_length_id=1,
            sequencing_depth=1,
            library_protocol_id=1,
            library_type_id=1,
            amplification_cycles=1,
            index_type_id=1,
            index_reads=0,
            mean_fragment_size=1,
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
