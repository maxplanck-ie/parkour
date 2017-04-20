from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from library_sample_shared.models import BarcodeCounter
from .models import Library
from index_generator.models import Pool
from common.utils import generate_barcode


@receiver(post_save, sender=Library)
def create_barcode(sender, instance, created, **kwargs):
    if created:
        counter = BarcodeCounter.load()
        counter.increment()
        counter.save()

        instance.barcode = generate_barcode('L', str(counter.counter))
        instance.save()


@receiver(pre_save, sender=Library)
def update_pool_size(sender, instance, **kwargs):
    """ If a saving library is in a pool, update the pool size. """
    if instance.pk is not None:
        try:
            pool = instance.pool.get()
            library = Library.objects.get(pk=instance.pk)
            old_value = library.sequencing_depth
            new_value = instance.sequencing_depth
            diff = new_value - old_value

            if diff != 0:
                pool.size += diff
                pool.save()

        except Pool.DoesNotExist:
            pass
