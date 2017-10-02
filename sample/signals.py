from django.db.models.signals import post_save
from django.dispatch import receiver
from library_sample_shared.models import BarcodeCounter
from .models import Sample
from common.utils import generate_barcode


@receiver(post_save, sender=Sample)
def create_barcode(sender, instance, created, **kwargs):
    if created:
        counter = BarcodeCounter.load()
        counter.increment()
        counter.save()

        instance.barcode = generate_barcode('S', str(counter.counter))
        instance.save(update_fields=['barcode'])
