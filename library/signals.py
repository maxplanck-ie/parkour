from django.db.models.signals import post_save
from django.dispatch import receiver

from library_sample_shared.models import BarcodeCounter
from .models import Library
from common.utils import generate_barcode


@receiver(post_save, sender=Library)
def create_barcode(sender, instance, created, **kwargs):
    if created:
        counter = BarcodeCounter.load()
        counter.increment()
        counter.save()

        instance.barcode = generate_barcode('L', str(counter.counter))
        instance.save()
