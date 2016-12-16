from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .models import Flowcell


@receiver(pre_delete, sender=Flowcell)
def delete_lanes(sender, instance, **kwargs):
    lanes = instance.lanes.select_related('pool')

    # Update Loaded field
    for lane in lanes:
        pool = lane.pool
        pool.loaded -= instance.sequencer.lane_capacity
        pool.save(update_fields=['loaded'])

    lanes.delete()
