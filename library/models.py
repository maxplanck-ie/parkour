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


class Organism(models.Model):
    name = models.CharField('Organism', max_length=200)

    def __str__(self):
        return self.name


class IndexType(models.Model):
    name = models.CharField('Index Type', max_length=200)

    def __str__(self):
        return self.name


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


class ConcentrationMethod(models.Model):
    name = models.CharField('Name', max_length=200)

    def __str__(self):
        return self.name


class SequencingRunCondition(models.Model):
    name = models.CharField('Name', max_length=200)

    def __str__(self):
        return self.name


class Library(models.Model):
    library_name = models.CharField('Library Name', max_length=200)
    date = models.DateField('Date', auto_now_add=True)
    library_protocol = models.ForeignKey(LibraryProtocol, verbose_name='Library Protocol')
    library_type = models.ForeignKey(LibraryType, verbose_name='Library Type')
    enrichment_cycles = models.IntegerField('No. of Enrichment Cycles')
    organism = models.ForeignKey(Organism, verbose_name='Organism')
    index_type = models.ForeignKey(IndexType, verbose_name='Index Type')
    index_reads = models.IntegerField('Index Reads')
    index_i7 = models.CharField('Index I7', max_length=200)
    index_i5 = models.CharField('Index I5', max_length=200)
    equal_representation_nucleotides = models.BooleanField()
    dna_dissolved_in = models.CharField('DNA Dissolved in', max_length=200)
    concentration = models.FloatField('Concentration')
    concentration_determined_by = models.ForeignKey(ConcentrationMethod, verbose_name='Concentration Determined by')
    sample_volume = models.IntegerField('Sample Volume')
    qpcr_result = models.FloatField('qPCR Result')
    sequencing_run_condition = models.ForeignKey(SequencingRunCondition, verbose_name='Sequencing Run Condition')
    sequencing_depth = models.IntegerField('Sequencing Depth')
    comments = models.TextField('Comments')

    class Meta:
        verbose_name = 'Library'
        verbose_name_plural = 'Libraries'

    def __str__(self):
        return self.library_name
