from django.db.models.signals import pre_delete, post_delete
from django.dispatch import receiver

from .models import Request, FileRequest


# @receiver(pre_delete, sender=Request)
# def delete_libraries_and_samples(sender, instance, **kwargs):
#     instance.libraries.all().delete()
#     instance.samples.all().delete()


# @receiver(pre_delete, sender=Request)
# def delete_library_file_object(sender, instance, **kwargs):
#     for file in instance.files.all():
#         file.delete()


# @receiver(post_delete, sender=FileRequest)
# def delete_library_file(sender, instance, **kwargs):
#     # Pass False so FileField doesn't save the model.
#     instance.file.delete(False)
