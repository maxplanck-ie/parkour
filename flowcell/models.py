from django.db import models
from index_generator.models import Pool


class Sequencer(models.Model):
    name = models.CharField('Name', max_length=50)
    lanes = models.PositiveSmallIntegerField('Number of Lanes')
    lane_capacity = models.PositiveSmallIntegerField('Lane Capacity')

    def __str__(self):
        return self.name


class Lane(models.Model):
    name = models.CharField('Name', max_length=6)
    pool = models.OneToOneField(Pool, verbose_name='Pool')
    loading_concentration = models.FloatField('Loading Concentration')

    def __str__(self):
        return '%s: %s' % (self.name, self.pool.name)


class Flowcell(models.Model):
    # sequencer = models.OneToOneField(Sequencer, verbose_name='Sequencer')
    sequencer = models.ForeignKey(Sequencer, verbose_name='Sequencer')
    flowcell_id = models.CharField('Flowcell ID', max_length=50)
    lanes = models.ManyToManyField(Lane, related_name='flowcell', blank=True)

    def __str__(self):
        return self.flowcell_id
