from django.db.models.signals import post_save
# from django.db.models.signals import pre_delete, post_delete
from django.dispatch import receiver
# from library_preparation.models import LibraryPreparation
# from pooling.models import Pooling
from .models import Pool


@receiver(post_save, sender=Pool)
def update_pool_name_or_size(sender, instance, created, **kwargs):
    if created:
        instance.name = '%i_%s' % (instance.id, instance.user.last_name)
        if instance.user.pi:
            instance.name += '_' + instance.user.pi.name
        instance.save()

    # Update Pool Size
    update_fields = kwargs.pop('update_fields')
    if update_fields and update_fields == {'size'}:
        libraries = instance.libraries.all()
        samples = instance.samples.all()
        instance.size += sum([l.sequencing_depth for l in libraries])
        instance.size += sum([s.sequencing_depth for s in samples])
        instance.save()


# @receiver(pre_delete, sender=Pool)
# def delete_dependent_objects(sender, instance, **kwargs):
#     libraries = instance.libraries.all()
#     samples = instance.samples.all()
#
#     for library in libraries:
#         library.is_pooled = False
#         library.save(update_fields=['is_pooled'])
#
#     for sample in samples:
#         sample.is_pooled = False
#         sample.save(update_fields=['is_pooled'])
#
#     # Delete all dependent Library Preparation and Pooling objects
#     LibraryPreparation.objects.filter(sample__in=samples).delete()
#     Pooling.objects.filter(library__in=libraries).delete()
#     Pooling.objects.filter(sample__in=samples).delete()


# @receiver(post_delete, sender=Pool)
# def delete_file(sender, instance, **kwargs):
#     # Delete uploaded file after deleting a pool
#     if instance.file:
#         instance.file.delete(False)
