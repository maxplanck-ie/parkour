from django.db import models


class Sequencer(models.Model):
    name = models.CharField('Name', max_length=50)
    lanes = models.PositiveSmallIntegerField('Number of Lanes')
    lane_capacity = models.PositiveSmallIntegerField('Lane Capacity')

    def __str__(self):
        return self.name
