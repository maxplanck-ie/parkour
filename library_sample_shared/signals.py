from django.dispatch import receiver
from django.db.models.signals import post_save

from .models import LibraryProtocol, LibraryType


@receiver(post_save, sender=LibraryProtocol)
def add_protocol_to_libraty_type(sender, instance, created, **kwargs):
    if created:
        try:
            library_type = LibraryType.objects.get(name='Other')
        except LibraryType.DoesNotExist:
            pass
        else:
            library_type.library_protocol.add(instance)
