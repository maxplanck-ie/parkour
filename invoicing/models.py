from django.db import models

from library_sample_shared.models import LibraryProtocol, ReadLength
from flowcell.models import Sequencer


class FixedCosts(models.Model):
    sequencer = models.OneToOneField(Sequencer)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        verbose_name = 'Fixed Cost'
        verbose_name_plural = 'Fixed Costs'

    @property
    def price_amount(self):
        return f'{self.price} €'

    def __str__(self):
        return self.sequencer.name


class LibraryPreparationCosts(models.Model):
    library_protocol = models.OneToOneField(LibraryProtocol)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        verbose_name = 'Library Preparation Cost'
        verbose_name_plural = 'Library Preparation Costs'

    @property
    def price_amount(self):
        return f'{self.price} €'

    def __str__(self):
        return self.library_protocol.name


class SequencingCosts(models.Model):
    sequencer = models.ForeignKey(Sequencer)
    read_length = models.ForeignKey(ReadLength, verbose_name='Read Length')
    price = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        verbose_name = 'Sequencing Cost'
        verbose_name_plural = 'Sequencing Costs'
        unique_together = ('sequencer', 'read_length',)

    @property
    def price_amount(self):
        return f'{self.price} €'

    def __str__(self):
        return f'{self.sequencer.name} {self.read_length.name}'
