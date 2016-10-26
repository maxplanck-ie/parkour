from django.db import models
from django.forms import ModelForm
from django.db.models.signals import post_delete, pre_delete
from django.dispatch import receiver


from functools import partial
from time import strftime
import uuid
import os


def _update_filename(instance, filename, path):
    filename = '%s_%s' % (uuid.uuid4(), filename)
    return os.path.join(strftime(path), filename)


def upload_to(path):
    return partial(_update_filename, path=path)


class LibraryProtocol(models.Model):
    name = models.CharField('Protocol', max_length=200)
    provider = models.CharField('Provider', max_length=150)

    def __str__(self):
        return self.name


class LibraryType(models.Model):
    name = models.CharField('Type', max_length=200)
    library_protocol = models.ManyToManyField(
        LibraryProtocol,
        verbose_name='Library Protocol',
    )

    def __str__(self):
        return self.name


class SimpleField(models.Model):
    name = models.CharField('Name', max_length=200)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class Organism(SimpleField):
    pass


class IndexType(SimpleField):
    pass


class Index(models.Model):
    index_id = models.CharField('Index ID', max_length=50)
    index = models.CharField('Index', max_length=200)
    index_type = models.ForeignKey(IndexType, verbose_name='Index Type')

    class Meta:
        abstract = True

    def __str__(self):
        return self.index_id


class IndexI7(Index):
    pass


class IndexI5(Index):
    pass


class ConcentrationMethod(SimpleField):
    pass


class SequencingRunCondition(SimpleField):
    pass


class NucleicAcidType(SimpleField):
    type = models.CharField(
        'Type',
        max_length=3,
        choices=(('DNA', 'DNA'), ('RNA', 'RNA')),
        default='DNA',
    )

    class Meta:
        verbose_name = 'Nucleic Acid Type'
        verbose_name_plural = 'Nucleic Acid Types'


class RNAQuality(SimpleField):
    class Meta:
        verbose_name = 'RNA Quality'
        verbose_name_plural = 'RNA Qualities'


class FileLibrary(models.Model):
    name = models.CharField('Name', max_length=200)
    file = models.FileField(upload_to=upload_to('libraries/%Y/%m/%d/'))

    def __str__(self):
        return self.name


@receiver(post_delete, sender=FileLibrary)
def filelibrary_delete(sender, instance, **kwargs):
    # Pass False so FileField doesn't save the model.
    instance.file.delete(False)


class FileSample(models.Model):
    name = models.CharField('Name', max_length=200)
    file = models.FileField(upload_to=upload_to('samples/%Y/%m/%d/'))

    def __str__(self):
        return self.name


@receiver(post_delete, sender=FileSample)
def filesample_delete(sender, instance, **kwargs):
    # Pass False so FileField doesn't save the model.
    instance.file.delete(False)


class BarcodeSingletonModel(models.Model):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super(BarcodeSingletonModel, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


class BarcodeCounter(BarcodeSingletonModel):
    counter = models.IntegerField(default=0)

    def increment(self):
        self.counter += 1

    def __str__(self):
        return str(self.counter)


class LibrarySampleAbstract(models.Model):
    name = models.CharField('Name', max_length=200, unique=True)
    date = models.DateTimeField('Date', auto_now_add=True)
    organism = models.ForeignKey(Organism, verbose_name='Organism')
    concentration = models.FloatField('Concentration')
    concentration_determined_by = models.ForeignKey(
        ConcentrationMethod,
        verbose_name='Concentration Determined by',
    )
    dna_dissolved_in = models.CharField('DNA Dissolved in', max_length=200)
    sample_volume = models.IntegerField('Sample Volume')
    equal_representation_nucleotides = models.BooleanField(
        'Equal Representation of Nucleotides',
    )
    sequencing_run_condition = models.ForeignKey(
        SequencingRunCondition,
        verbose_name='Sequencing Run Condition',
    )
    sequencing_depth = models.IntegerField('Sequencing Depth')
    comments = models.TextField('Comments', null=True, blank=True)
    is_in_request = models.BooleanField(default=False)
    barcode = models.CharField('Barcode', max_length=9, null=True, blank=True)

    # Quality Control
    dilution_factor = models.IntegerField(
        'Dilution Factor',
        null=True,
        blank=True,
    )
    concentration_facility = models.FloatField(
        'Concentration (facility)',
        null=True,
        blank=True,
    )
    concentration_determined_by_facility = models.ForeignKey(
        ConcentrationMethod,
        verbose_name='Concentration Determined by (facility)',
        related_name='+',
        null=True,
        blank=True,
    )
    date_facility = models.DateTimeField(
        'Date (facility)',
        null=True,
        blank=True,
    )
    sample_volume_facility = models.IntegerField(
        'Sample Volume (facility)',
        null=True,
        blank=True,
    )
    amount_facility = models.FloatField(
        'Amount',
        null=True,
        blank=True,
    )
    size_distribution_facility = models.CharField(
        'Size Distribution',
        max_length=200,
        null=True,
        blank=True,
    )
    comments_facility = models.TextField(
        'Comments (facility)',
        null=True,
        blank=True,
    )
    qc_result = models.CharField(
        'QC Result',
        max_length=50,
        null=True,
        blank=True,
    )

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class Library(LibrarySampleAbstract):
    library_protocol = models.ForeignKey(
        LibraryProtocol,
        verbose_name='Library Protocol',
    )
    library_type = models.ForeignKey(LibraryType, verbose_name='Library Type')
    enrichment_cycles = models.IntegerField('No. of Enrichment Cycles')
    index_type = models.ForeignKey(IndexType, verbose_name='Index Type')
    index_reads = models.IntegerField('Index Reads')
    index_i7 = models.CharField(
        'Index I7',
        max_length=200,
        null=True,
        blank=True,
    )
    index_i5 = models.CharField(
        'Index I5',
        max_length=200,
        null=True,
        blank=True,
    )
    mean_fragment_size = models.IntegerField('Mean Fragment Size')
    qpcr_result = models.FloatField('qPCR Result', null=True, blank=True)
    files=models.ManyToManyField(FileLibrary)

    # Quality Control
    qpcr_result_facility = models.FloatField(
        'qPCR Result (facility)',
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = 'Library'
        verbose_name_plural = 'Libraries'


class LibraryForm(ModelForm):
    class Meta:
        model = Library
        fields = (
            'name',
            'library_protocol',
            'library_type',
            'enrichment_cycles',
            'organism',
            'index_type',
            'index_reads',
            'index_i7',
            'index_i5',
            'equal_representation_nucleotides',
            'dna_dissolved_in',
            'concentration',
            'concentration_determined_by',
            'sample_volume',
            'mean_fragment_size',
            'qpcr_result',
            'sequencing_run_condition',
            'sequencing_depth',
            'comments',
        )


@receiver(pre_delete, sender=Library)
def sample_delete(sender, instance, **kwargs):
    for file in instance.files.all():
        file.delete()


class SampleProtocol(models.Model):
    name = models.CharField('Name', max_length=200)
    type = models.CharField(
        'Type',
        max_length=3,
        choices=(('DNA', 'DNA'), ('RNA', 'RNA')),
        default='DNA',
    )
    provider = models.CharField('Provider', max_length=150)
    catalog = models.CharField('Catalog', max_length=150)
    explanation = models.CharField('Explanation', max_length=250)
    input_requirements = models.CharField('Input Requirements', max_length=150)
    typical_application = models.CharField(
        'Typical Application',
        max_length=100,
    )
    comments = models.TextField('Comments', null=True, blank=True)

    def __str__(self):
        return self.name


class Sample(LibrarySampleAbstract):
    sample_protocol = models.ForeignKey(
        SampleProtocol,
        verbose_name='Sample Protocol',
    )
    nucleic_acid_type = models.ForeignKey(
        NucleicAcidType,
        verbose_name='Nucleic Acid Type',
    )
    amplified_cycles = models.IntegerField(
        'Sample Amplified Cycles',
        null=True,
        blank=True,
    )
    dnase_treatment = models.NullBooleanField('DNase Treatment')
    rna_quality = models.ForeignKey(
        RNAQuality,
        verbose_name='RNA Quality',
        null=True,
        blank=True,
    )
    rna_spike_in = models.NullBooleanField('RNA Spike in')
    sample_preparation_protocol = models.CharField(
        'Sample Preparation Protocol',
        max_length=250,
        null=True,
        blank=True,
    )
    requested_sample_treatment = models.CharField(
        'Requested Sample Treatment',
        max_length=250,
        null=True,
        blank=True,
    )
    files=models.ManyToManyField(FileSample)

    # Quality Control
    rna_quality_facility = models.FloatField(
        'RNA Quality (RIN, RQN) (facility)',
        null=True,
        blank=True,
    )


class SampleForm(ModelForm):
    class Meta:
        model = Sample
        fields = (
            'name',
            'nucleic_acid_type',
            'sample_protocol',
            'organism',
            'equal_representation_nucleotides',
            'dna_dissolved_in',
            'concentration',
            'concentration_determined_by',
            'sample_volume',
            'amplified_cycles',
            'dnase_treatment',
            'rna_quality',
            'rna_spike_in',
            'sample_preparation_protocol',
            'requested_sample_treatment',
            'sequencing_run_condition',
            'sequencing_depth',
            'comments',
        )


@receiver(pre_delete, sender=Sample)
def sample_delete(sender, instance, **kwargs):
    for file in instance.files.all():
        file.delete()
