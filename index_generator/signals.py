from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Pool


@receiver(post_save, sender=Pool)
def update_pool_name(sender, instance, created, **kwargs):
    # Update the name only for a just created pool
    if created:
        instance.name = str(instance.id) + instance.name
        instance.save()
