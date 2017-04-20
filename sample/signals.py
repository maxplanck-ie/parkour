from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from library_sample_shared.models import BarcodeCounter
from .models import Sample
from index_generator.models import Pool
from common.utils import generate_barcode


@receiver(post_save, sender=Sample)
def create_barcode(sender, instance, created, **kwargs):
    if created:
        counter = BarcodeCounter.load()
        counter.increment()
        counter.save()

        instance.barcode = generate_barcode('S', str(counter.counter))
        instance.save()


@receiver(pre_save, sender=Sample)
def update_pool_size(sender, instance, **kwargs):
    """ If a saving sample is in a pool, update the pool size. """
    if instance.pk is not None:
        try:
            pool = instance.pool.get()
            sample = Sample.objects.get(pk=instance.pk)
            old_value = sample.sequencing_depth
            new_value = instance.sequencing_depth
            diff = new_value - old_value

            if diff != 0:
                pool.size += diff
                pool.save()

        except Pool.DoesNotExist:
            pass
