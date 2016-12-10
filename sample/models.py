from django.db import models
from library_sample_shared.models import GenericLibrarySample


class SampleProtocol(models.Model):
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
        verbose_name = 'Sample Protocol'
        verbose_name_plural = 'Sample Protocols'

    def __str__(self):
        return self.name


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
    sample_protocol = models.ForeignKey(
        SampleProtocol,
        related_name='sample_protocol',
        verbose_name='Sample Protocol',
    )

    nucleic_acid_type = models.ForeignKey(
        NucleicAcidType,
        related_name='nucleic_acid_type',
        verbose_name='Nucleic Acid Type',
    )

    amplified_cycles = models.PositiveIntegerField(
        'Sample Amplified Cycles',
        null=True,
        blank=True,
    )

    dnase_treatment = models.NullBooleanField('DNase Treatment')

    rna_quality = models.CharField(
        'RNA Quality',
        max_length=2,
        choices=(
            (1, '1'),
            (2, '2'),
            (3, '3'),
            (4, '4'),
            (5, '5'),
            (6, '6'),
            (7, '7'),
            (8, '8'),
            (9, '9'),
            (10, '10'),
            (11, 'Determined by Facility'),
        ),
        null=True,
        blank=True,
    )

    rna_spike_in = models.NullBooleanField('RNA Spike in')

    sample_preparation_protocol = models.CharField(
        'Sample Preparation Protocol',
        max_length=150,
        null=True,
        blank=True,
    )

    requested_sample_treatment = models.CharField(
        'Requested Sample Treatment',
        max_length=200,
        null=True,
        blank=True,
    )

    files = models.ManyToManyField(FileSample, related_name='files')

    is_converted = models.BooleanField('Is converted?', default=False)

    # Quality Control
    rna_quality_facility = models.FloatField(
        'RNA Quality (RIN, RQN) (facility)',
        null=True,
        blank=True,
    )

    @classmethod
    def get_test_sample(cls, name):
        return cls(
            name=name,
            organism_id=1,
            concentration=1.0,
            concentration_determined_by_id=1,
            dna_dissolved_in='dna',
            sample_volume=1,
            read_length_id=1,
            sequencing_depth=1,
            sample_protocol_id=1,
            nucleic_acid_type_id=1,
        )

    class Meta:
        verbose_name = 'Sample'
        verbose_name_plural = 'Samples'
