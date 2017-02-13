import string
import random

from django.db import models

from library_sample_shared.models import GenericLibrarySample


class LibraryProtocol(models.Model):
    name = models.CharField('Protocol', max_length=150)
    provider = models.CharField('Provider', max_length=100)

    class Meta:
        verbose_name = 'Library Protocol'
        verbose_name_plural = 'Library Protocols'

    def __str__(self):
        return self.name


class LibraryType(models.Model):
    name = models.CharField('Type', max_length=200)

    library_protocol = models.ManyToManyField(
        LibraryProtocol,
        verbose_name='Library Protocol',
    )

    class Meta:
        verbose_name = 'Library Type'
        verbose_name_plural = 'Library Types'

    def __str__(self):
        return self.name


class FileLibrary(models.Model):
    name = models.CharField('Name', max_length=200)
    file = models.FileField(upload_to='libraries/%Y/%m/%d/')

    def __str__(self):
        return self.name


class Library(GenericLibrarySample):
    library_protocol = models.ForeignKey(
        LibraryProtocol,
        verbose_name='Library Protocol',
    )

    library_type = models.ForeignKey(
        LibraryType,
        verbose_name='Library Type',
    )

    enrichment_cycles = models.PositiveIntegerField('No. of Enrichment Cycles')

    index_reads = models.PositiveSmallIntegerField('Index Reads')

    mean_fragment_size = models.PositiveIntegerField('Mean Fragment Size')

    qpcr_result = models.FloatField('qPCR Result', null=True, blank=True)

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
            dna_dissolved_in='dna',
            sample_volume=1,
            read_length_id=1,
            sequencing_depth=1,
            library_protocol_id=1,
            library_type_id=1,
            enrichment_cycles=1,
            index_type_id=4,  # Other
            index_reads=0,
            mean_fragment_size=1,
        )

    class Meta:
        verbose_name = 'Library'
        verbose_name_plural = 'Libraries'
