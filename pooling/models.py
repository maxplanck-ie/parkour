from django.db import models
from django.forms import ModelForm
from library.models import Library, Sample


class PoolFile(models.Model):
    file = models.FileField(upload_to='pooling/%Y/%m/%d/')

    def __str__(self):
        return self.file.name.split('/')[-1]


class Pool(models.Model):
    name = models.CharField('Name', max_length=100)
    libraries = models.ManyToManyField(Library, blank=True)
    samples = models.ManyToManyField(Sample, blank=True)
    size = models.IntegerField('Pool Size', default=0, blank=True)

    file = models.ForeignKey(
        PoolFile,
        verbose_name='File',
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.name


class LibraryPreparationFile(models.Model):
    file = models.FileField(upload_to='library_preparation/%Y/%m/%d/')

    def __str__(self):
        return self.file.name.split('/')[-1]


class LibraryPreparation(models.Model):
    sample = models.ForeignKey(Sample, verbose_name='Sample')

    starting_amount = models.FloatField(
        'Starting Amount',
        null=True,
        blank=True,
    )

    starting_volume = models.FloatField(
        'Starting Amount',
        null=True,
        blank=True,
    )

    spike_in_description = models.TextField(
        'Spike-in Description',
        null=True,
        blank=True,
    )

    spike_in_volume = models.FloatField(
        'Spike-in Volume',
        null=True,
        blank=True,
    )

    ul_sample = models.FloatField(
        'µl Sample',
        null=True,
        blank=True,
    )

    ul_buffer = models.FloatField(
        'µl Buffer',
        null=True,
        blank=True,
    )

    pcr_cycles = models.IntegerField(
        'PCR Cycles',
        null=True,
        blank=True,
    )

    concentration_library = models.FloatField(
        'Concentration Library',
        null=True,
        blank=True,
    )

    mean_fragment_size = models.IntegerField(
        'Mean Fragment Size',
        null=True,
        blank=True,
    )

    nM = models.FloatField(
        'nM',
        null=True,
        blank=True,
    )

    file = models.ForeignKey(
        LibraryPreparationFile,
        verbose_name='File',
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.sample.name


class LibraryPreparationForm(ModelForm):
    class Meta:
        model = LibraryPreparation
        fields = (
            'starting_amount',
            'starting_volume',
            'spike_in_description',
            'spike_in_volume',
            'ul_sample',
            'ul_buffer',
            'pcr_cycles',
            'concentration_library',
            'mean_fragment_size',
            'nM',
        )


class Pooling(models.Model):
    library = models.ForeignKey(
        Library,
        verbose_name='Library',
        null=True,
        blank=True
    )

    sample = models.ForeignKey(
        Sample,
        verbose_name='Sample',
        null=True,
        blank=True
    )

    concentration_c1 = models.FloatField(
        'Concentration C1',
        null=True,
        blank=True
    )

    concentration_c2 = models.FloatField(
        'Concentration C2',
        null=True,
        blank=True
    )

    sample_volume = models.FloatField(
        'Sample Volume V1',
        null=True,
        blank=True
    )

    buffer_volume = models.FloatField(
        'Buffer Volume V2',
        null=True,
        blank=True
    )

    percentage_library = models.IntegerField(
        '% library in Pool',
        null=True,
        blank=True,
    )

    volume_to_pool = models.FloatField(
        'Volume to Pool',
        null=True,
        blank=True
    )

    def __str__(self):
        return self.library.name if self.library else self.sample.name


class PoolingForm(ModelForm):
    class Meta:
        model = Pooling
        fields = (
            'concentration_c1',
            'concentration_c2',
            'sample_volume',
            'buffer_volume',
        )
