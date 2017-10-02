from django.db.models import F, Func, Value
# from django.db.models.signals import post_save
from django.db.models.signals import m2m_changed
from django.dispatch import receiver

from .models import Pool
from library_preparation.models import LibraryPreparation


# @receiver(post_save, sender=Pool)
# def update_pool_name(sender, instance, created, **kwargs):
#     """ Update the pool name after receiving a Pool id. """
#     if created:
#         instance.name = 'Pool_%i' % instance.pk
#         instance.save()


@receiver(m2m_changed, sender=Pool.samples.through)
def update_sample(sender, instance, action, **kwargs):
    """
    When a sample is added to a pool, set its is_pooled and is_converted
    to True, update the barcode, and for each sample in the pool create a
    LibraryPreparation object.
    """
    if action == 'post_add':
        instance.samples.all().update(
            is_pooled=True,
            is_converted=True,
            barcode=Func(
                F('barcode'),
                Value('S'), Value('L'),
                function='replace',
            ),
        )

        # TODO: maybe there is a better way to create multiple objects at once
        for sample in instance.samples.all():
            obj = LibraryPreparation(sample=sample)
            obj.save()
