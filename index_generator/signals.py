from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Pool


@receiver(post_save, sender=Pool)
def update_pool_name(sender, instance, created, **kwargs):
    if created:
        instance.name = 'Pool_%i' % instance.pk
        instance.save()
