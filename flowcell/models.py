from django.db import models


class Sequencer(models.Model):
    name = models.CharField('Name', max_length=255)
    lanes = models.IntegerField('Number of Lanes')
    lane_capacity = models.IntegerField('Lane Capacity')

    def __str__(self):
        return self.name
