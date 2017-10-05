from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver

from sample.models import Sample
from index_generator.models import Pool
from .models import Pooling


@receiver(m2m_changed, sender=Pool.libraries.through)
def update_libraries(sender, instance, action, **kwargs):
    """
    When a library is added to a pool, set its is_pooled to True, and
    for each library create a Pooling object.
    """
    if action == 'post_add':
        instance.libraries.all().update(is_pooled=True)

        # TODO: maybe there is a better way to create multiple objects at once
        for library in instance.libraries.all():
            obj = Pooling(library=library)
            obj.save()


@receiver(post_save, sender=Sample)
def create_pooling_objects_sample(sender, instance, **kwargs):
    """
    When a sample passes the quality check and reaches the status 4,
    create a Pooling object for it.
    """

    if instance.status == 4:
        try:
            Pooling.objects.get(pk=instance.pk)

        except Pooling.DoesNotExist:
            pooling_obj = Pooling(sample=instance)
            pooling_obj.save()

        else:
            pass
