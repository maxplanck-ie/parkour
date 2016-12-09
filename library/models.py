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
        related_name='library_protocol',
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
        related_name='library_type',
        verbose_name='Library Type',
    )

    enrichment_cycles = models.PositiveIntegerField('No. of Enrichment Cycles')

    index_reads = models.PositiveSmallIntegerField('Index Reads')

    mean_fragment_size = models.PositiveIntegerField('Mean Fragment Size')

    qpcr_result = models.FloatField('qPCR Result', null=True, blank=True)

    files = models.ManyToManyField(FileLibrary, related_name='files')

    # Quality Control
    qpcr_result_facility = models.FloatField(
        'qPCR Result (facility)',
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = 'Library'
        verbose_name_plural = 'Libraries'
