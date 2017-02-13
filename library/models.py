import string
import random

from django.db import models

from library_sample_shared.models import GenericLibrarySample


class FileLibrary(models.Model):
    name = models.CharField('Name', max_length=200)
    file = models.FileField(upload_to='libraries/%Y/%m/%d/')

    def __str__(self):
        return self.name


class Library(GenericLibrarySample):
    index_reads = models.PositiveSmallIntegerField('Index Reads')
    mean_fragment_size = models.PositiveIntegerField(
        'Mean Fragment Size',
        null=True,
        blank=True,
    )
    qpcr_result = models.FloatField('qPCR Result', null=True, blank=True)
    amplification_cycles = models.PositiveIntegerField(
        'Amplification (cycles)',
    )
    files = models.ManyToManyField(
        FileLibrary,
        related_name='files',
        blank=True,
    )

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
            enrichment_cycles=1,
            index_type_id=4,  # Other
            amplification_cycles=1,
            index_type_id=1,
            index_reads=0,
            mean_fragment_size=1,
        )

    class Meta:
        verbose_name = 'Library'
        verbose_name_plural = 'Libraries'
