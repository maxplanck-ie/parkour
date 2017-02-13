import string
import random

from django.db import models

from library_sample_shared.models import GenericLibrarySample


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


class FileSample(models.Model):
    name = models.CharField('Name', max_length=200)
    file = models.FileField(upload_to='samples/%Y/%m/%d/')

    def __str__(self):
        return self.name


class Sample(GenericLibrarySample):
    nucleic_acid_type = models.ForeignKey(
        NucleicAcidType,
        verbose_name='Nucleic Acid Type',
    )
    rna_quality = models.CharField(
        'RNA Quality',
        max_length=2,
        choices=(
            ('1', '1'),
            ('2', '2'),
            ('3', '3'),
            ('4', '4'),
            ('5', '5'),
            ('6', '6'),
            ('7', '7'),
            ('8', '8'),
            ('9', '9'),
            ('10', '10'),
            ('11', 'Determined by Facility'),
        ),
        null=True,
        blank=True,
    )
    amplification_cycles = models.PositiveIntegerField(
        'Amplification (cycles)',
        null=True,
        blank=True,
    )
    files = models.ManyToManyField(
        FileSample,
        related_name='files',
        blank=True,
    )
    is_converted = models.BooleanField('Is converted?', default=False)

    # Quality Control
    rna_quality_facility = models.FloatField(
        'RNA Quality (RIN, RQN) (facility)',
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
