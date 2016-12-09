from django.db.models.signals import post_save, pre_delete, post_delete
from django.dispatch import receiver
from library_sample_shared.models import BarcodeCounter
from .models import Library, FileLibrary
from common.utils import generate_barcode


@receiver(post_save, sender=Library)
def create_barcode(sender, instance, created, **kwargs):
    if created:
        counter = BarcodeCounter.load()
        counter.increment()
        counter.save()

        instance.barcode = generate_barcode('L', str(counter.counter))
        instance.save()


@receiver(pre_delete, sender=Library)
def delete_library_file_object(sender, instance, **kwargs):
    for file in instance.files.all():
        file.delete()


@receiver(post_delete, sender=FileLibrary)
def delete_library_file(sender, instance, **kwargs):
    # Pass False so FileField doesn't save the model.
    instance.file.delete(False)
