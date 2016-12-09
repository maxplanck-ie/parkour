from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import LibraryPreparation


@receiver(post_delete, sender=LibraryPreparation)
def delete_file(sender, instance, **kwargs):
    # Delete uploaded file after deleting a Library Preparation object
    if instance.file:
        instance.file.delete(False)
