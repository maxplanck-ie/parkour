from django.db.models.signals import (pre_save, post_save,
                                      pre_delete, post_delete)
from django.dispatch import receiver
from library_sample_shared.models import BarcodeCounter
from .models import Library, FileLibrary
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
    """ If a saving sample in a pool, update the pool size. """
    if instance.pk is not None:
        for pool in Pool.objects.prefetch_related('libraries'):
            libraries = pool.libraries.all()
            if instance in libraries:
                library = Library.objects.get(pk=instance.pk)
                old_value = library.sequencing_depth
                new_value = instance.sequencing_depth
                diff = new_value - old_value
                if diff != 0:
                    pool.size += diff
                    pool.save()
                    break


@receiver(pre_delete, sender=Library)
def delete_library_file_object(sender, instance, **kwargs):
    for file in instance.files.all():
        file.delete()


@receiver(post_delete, sender=FileLibrary)
def delete_library_file(sender, instance, **kwargs):
    # Pass False so FileField doesn't save the model.
    instance.file.delete(False)
