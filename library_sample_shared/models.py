from datetime import datetime

from django.db import models

from common.models import DateTimeMixin


class Organism(models.Model):
    name = models.CharField('Name', max_length=100)

    def __str__(self):
        return self.name


class ConcentrationMethod(models.Model):
    name = models.CharField('Name', max_length=100)

    class Meta:
        verbose_name = 'Concentration Method'
        verbose_name_plural = 'Concentration Methods'

    def __str__(self):
        return self.name


class ReadLength(models.Model):
    name = models.CharField('Name', max_length=50)

    class Meta:
        verbose_name = 'Read Length'
        verbose_name_plural = 'Read Lengths'

    def __str__(self):
        return self.name


class GenericIndex(models.Model):
    index_id = models.CharField('Index ID', max_length=15, unique=True)
    index = models.CharField('Index', max_length=8)

    class Meta:
        abstract = True

    def __str__(self):
        return self.index_id

    def type(self):
        try:
            index_type = self.index_type.get()
        except AttributeError:
            return ''
        else:
            return index_type.name


class IndexI7(GenericIndex):
    class Meta:
        verbose_name = 'Index I7'
        verbose_name_plural = 'Indices I7'


class IndexI5(GenericIndex):
    class Meta:
        verbose_name = 'Index I5'
        verbose_name_plural = 'Indices I5'


class IndexType(models.Model):
    name = models.CharField('Name', max_length=100)
    is_index_i7 = models.BooleanField('Is Index I7?', default=False)
    is_index_i5 = models.BooleanField('Is Index I5?', default=False)
    index_length = models.CharField(
        'Index Length',
        max_length=1,
        choices=(
            ('6', '6'),
            ('8', '8'),
        ),
        default='8',
    )

    indices_i7 = models.ManyToManyField(
        IndexI7,
        verbose_name='Indices I7',
        related_name='index_type',
        blank=True,
    )

    indices_i5 = models.ManyToManyField(
        IndexI5,
        verbose_name='Indices I5',
        related_name='index_type',
        blank=True,
    )

    class Meta:
        verbose_name = 'Index Type'
        verbose_name_plural = 'Index Types'

    def __str__(self):
        return self.name


class BarcodeCounter(models.Model):
    year = models.PositiveSmallIntegerField(
        default=datetime.now().year,
        unique=True
    )

    last_id = models.PositiveSmallIntegerField(default=0)

    @classmethod
    def load(cls, year=datetime.now().year):
        obj, created = cls.objects.get_or_create(year=year)
        return obj

    def increment(self):
        self.last_id += 1

    def __str__(self):
        return str(self.last_id)


class LibraryProtocol(models.Model):
    name = models.CharField('Name', max_length=150)
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
        max_length=200,
    )
    comments = models.TextField('Comments', null=True, blank=True)

    class Meta:
        verbose_name = 'Library Protocol'
        verbose_name_plural = 'Library Protocols'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        created = self.pk is None
        super().save(*args, **kwargs)

        if created:
            # When a new library protocol is created, add it to the list of
            # protocols of the Library Type 'Other'. If the latter does not
            # exist, create it
            try:
                library_type = LibraryType.objects.get(name='Other')
            except LibraryType.DoesNotExist:
                library_type = LibraryType(name='Other')
                library_type.save()
            finally:
                if self.name != 'Quality Control':
                    library_type.library_protocol.add(self)


class LibraryType(models.Model):
    name = models.CharField('Name', max_length=200)
    library_protocol = models.ManyToManyField(
        LibraryProtocol,
        verbose_name='Library Protocol',
    )

    class Meta:
        verbose_name = 'Library Type'
        verbose_name_plural = 'Library Types'

    def __str__(self):
        return self.name


class GenericLibrarySample(DateTimeMixin):
    name = models.CharField(
        'Name',
        max_length=200,
    )

    status = models.SmallIntegerField(default=0)

    library_protocol = models.ForeignKey(
        LibraryProtocol,
        verbose_name='Library Protocol',
    )

    library_type = models.ForeignKey(
        LibraryType,
        verbose_name='Library Type',
    )

    organism = models.ForeignKey(
        Organism,
        verbose_name='Organism'
    )

    concentration = models.FloatField('Concentration')

    concentration_method = models.ForeignKey(
        ConcentrationMethod,
        verbose_name='Concentration Method',
    )

    equal_representation_nucleotides = models.BooleanField(
        'Equal Representation of Nucleotides',
        default=True,
    )

    read_length = models.ForeignKey(
        ReadLength,
        verbose_name='Read Length',
    )

    sequencing_depth = models.PositiveIntegerField('Sequencing Depth')

    comments = models.TextField('Comments', null=True, blank=True)

    is_pooled = models.BooleanField('Pooled', default=False)

    barcode = models.CharField('Barcode', max_length=9)

    index_type = models.ForeignKey(
        IndexType,
        verbose_name='Index Type',
        null=True,
        blank=True,
    )

    index_reads = models.PositiveSmallIntegerField('Index Reads', default=0)

    index_i7 = models.CharField(
        'Index I7',
        max_length=8,
        null=True,
        blank=True,
    )

    index_i5 = models.CharField(
        'Index I5',
        max_length=8,
        null=True,
        blank=True,
    )

    amplification_cycles = models.PositiveIntegerField(
        'Amplification cycles',
        null=True,
        blank=True,
    )

    # Quality Control
    dilution_factor = models.PositiveIntegerField(
        'Dilution Factor (facility)',
        default=1,
        blank=True,
    )
    concentration_facility = models.FloatField(
        'Concentration (facility)',
        null=True,
        blank=True,
    )
    concentration_method_facility = models.ForeignKey(
        ConcentrationMethod,
        related_name='+',
        verbose_name='Concentration Method (facility)',
        null=True,
        blank=True,
    )
    sample_volume_facility = models.PositiveIntegerField(
        'Sample Volume (facility)',
        null=True,
        blank=True,
    )
    date_facility = models.DateTimeField(
        'Date (facility)',
        null=True,
        blank=True,
    )
    amount_facility = models.FloatField(
        'Amount (facility)',
        null=True,
        blank=True,
    )
    size_distribution_facility = models.CharField(
        'Size Distribution (facility)',
        max_length=200,
        null=True,
        blank=True,
    )
    comments_facility = models.TextField(
        'Comments (facility)',
        null=True,
        blank=True,
    )

    class Meta:
        abstract = True

    # def get_record_type(self):
    #     return 'L' if 'L' in self.barcode else 'S'

    def generate_barcode(self):
        counter = BarcodeCounter.load()
        counter.increment()
        counter.save()

        record_type = self.__class__.__name__[0]
        barcode = datetime.now().strftime('%y') + record_type
        barcode += '0' * (6 - len(str(counter))) + str(counter)

        self.barcode = barcode
        self.save(update_fields=['barcode'])

    def save(self, *args, **kwargs):
        created = self.pk is None
        super().save(*args, **kwargs)

        if created:
            self.generate_barcode()

    def __str__(self):
        return self.name
