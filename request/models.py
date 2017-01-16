from django.db import models
from django.conf import settings
from library.models import Library
from sample.models import Sample


class Request(models.Model):
    name = models.CharField('Name', max_length=100, blank=True)
    date_created = models.DateTimeField('Date', auto_now_add=True)
    description = models.TextField()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='User'
    )

    libraries = models.ManyToManyField(
        Library,
        related_name='request',
        blank=True,
    )

    samples = models.ManyToManyField(
        Sample,
        related_name='request',
        blank=True,
    )

    deep_seq_request = models.FileField(
        upload_to='requests/%Y/%m/%d/',
        blank=True,
        null=True,
    )

    def __str__(self):
        return '%s' % self.name
