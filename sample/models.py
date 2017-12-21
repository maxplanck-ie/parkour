import string
import random

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from common.utils import generate_barcode
from library_sample_shared.models import GenericLibrarySample, BarcodeCounter
# from pooling.models import Pooling


class NucleicAcidType(models.Model):
    name = models.CharField('Name', max_length=100)

    type = models.CharField(
        'Type',
        max_length=3,
        choices=(('DNA', 'DNA'), ('RNA', 'RNA')),
        default='DNA',
    )

    class Meta:
        verbose_name = 'Nucleic Acid Type'
        verbose_name_plural = 'Nucleic Acid Types'

    def __str__(self):
        return self.name


class Sample(GenericLibrarySample):
    nucleic_acid_type = models.ForeignKey(
        NucleicAcidType,
        verbose_name='Nucleic Acid Type',
    )

    rna_quality = models.FloatField(
        'RNA Quality',
        validators=[MinValueValidator(0.0), MaxValueValidator(11.0)],
        null=True,
        blank=True,
    )

    is_converted = models.BooleanField('Converted', default=False)

    # Quality Control
    rna_quality_facility = models.FloatField(
        'RNA Quality (facility)',
        validators=[MinValueValidator(0.0), MaxValueValidator(11.0)],
        null=True,
        blank=True,
    )

    @classmethod
    def get_test_sample(cls, name=None):
        if not name:
            name = 'Sample_' + ''.join(
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
            nucleic_acid_type_id=1,
        )

    class Meta:
        verbose_name = 'Sample'
        verbose_name_plural = 'Samples'

    def save(self, *args, **kwargs):
        # prev_obj = type(self).objects.get(pk=self.pk) if self.pk else None
        created = self.pk is None
        super().save(*args, **kwargs)

        if created:
            # Create barcode
            counter = BarcodeCounter.load()
            counter.increment()
            counter.save()

            self.barcode = generate_barcode('S', str(counter.counter))
            self.save(update_fields=['barcode'])

        # When a Library Preparation object passes the quality check and
        # the corresponding sample's status changes to 3,
        # create a Pooling object
        # if prev_obj and prev_obj.status in [2, -2] and self.status == 3:
        #     pooling_obj = Pooling(sample=self)
        #     pooling_obj.save()
