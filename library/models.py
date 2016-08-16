from django.db import models


class LibraryProtocol(models.Model):
    name = models.CharField('Protocol', max_length=200)
    provider = models.CharField('Provider', max_length=150)

    def __str__(self):
        return self.name


class LibraryType(models.Model):
    name = models.CharField('Type', max_length=200)
    library_protocol = models.ManyToManyField(LibraryProtocol, verbose_name='Library Protocol')

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
    type = models.CharField('Type', max_length=3, choices=(('DNA', 'DNA'), ('RNA', 'RNA')), default='DNA')

    class Meta:
        verbose_name = 'Nucleic Acid Type'
        verbose_name_plural = 'Nucleic Acid Types'


class RNAQuality(SimpleField):
    class Meta:
        verbose_name = 'RNA Quality'
        verbose_name_plural = 'RNA Qualities'


class LibrarySampleAbstract(models.Model):
    name = models.CharField('Name', max_length=200, unique=True)
    date = models.DateField('Date', auto_now_add=True)
    organism = models.ForeignKey(Organism, verbose_name='Organism')
    concentration = models.FloatField('Concentration')
    concentration_determined_by = models.ForeignKey(ConcentrationMethod, verbose_name='Concentration Determined by')
    dna_dissolved_in = models.CharField('DNA Dissolved in', max_length=200)
    sample_volume = models.IntegerField('Sample Volume')
    equal_representation_nucleotides = models.BooleanField('Equal Representation of Nucleotides')
    sequencing_run_condition = models.ForeignKey(SequencingRunCondition, verbose_name='Sequencing Run Condition')
    sequencing_depth = models.IntegerField('Sequencing Depth')
    comments = models.TextField('Comments', null=True, blank=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class Library(LibrarySampleAbstract):
    library_protocol = models.ForeignKey(LibraryProtocol, verbose_name='Library Protocol')
    library_type = models.ForeignKey(LibraryType, verbose_name='Library Type')
    enrichment_cycles = models.IntegerField('No. of Enrichment Cycles')
    index_type = models.ForeignKey(IndexType, verbose_name='Index Type')
    index_reads = models.IntegerField('Index Reads')
    index_i7 = models.CharField('Index I7', max_length=200, null=True, blank=True)
    index_i5 = models.CharField('Index I5', max_length=200, null=True, blank=True)
    mean_fragment_size = models.IntegerField('Mean Fragment Size')
    qpcr_result = models.FloatField('qPCR Result', null=True, blank=True)

    class Meta:
        verbose_name = 'Library'
        verbose_name_plural = 'Libraries'


class SampleProtocol(models.Model):
    name = models.CharField('Name', max_length=200)
    type = models.CharField('Type', max_length=3, choices=(('DNA', 'DNA'), ('RNA', 'RNA')), default='DNA')
    provider = models.CharField('Provider', max_length=150)
    catalog = models.CharField('Catalog', max_length=150)
    explanation = models.CharField('Explanation', max_length=250)
    input_requirements = models.CharField('Input Requirements', max_length=150)
    typical_application = models.CharField('Typical Application', max_length=100)
    comments = models.TextField('Comments', null=True, blank=True)

    def __str__(self):
        return self.name


class Sample(LibrarySampleAbstract):
    sample_protocol = models.ForeignKey(SampleProtocol, verbose_name='Sample Protocol')
    nucleic_acid_type = models.ForeignKey(NucleicAcidType, verbose_name='Nucleic Acid Type')
    amplified_cycles = models.IntegerField('Sample Amplified Cycles')
    dnase_treatment = models.NullBooleanField('DNase Treatment')
    rna_quality = models.ForeignKey(RNAQuality, verbose_name='RNA Quality', null=True, blank=True)
    rna_spike_in = models.NullBooleanField('RNA Spike in')
    sample_preparation_protocol = models.CharField('Sample Preparation Protocol', max_length=250, null=True, blank=True)
    requested_sample_treatment = models.CharField('Requested Sample Treatment', max_length=250, null=True, blank=True)
