from django.db import models
from django.forms import ModelForm
from django.conf import settings
from library.models import Library, Sample


class FileDeepSeqRequest(models.Model):
    name = models.CharField('Name', max_length=100)
    file = models.FileField(upload_to='requests/%Y/%m/%d/')

    def __str__(self):
        return self.name


class Request(models.Model):
    status = models.IntegerField(default=0)
    name = models.CharField('Name', max_length=100, blank=True)
    date_created = models.DateTimeField('Date', auto_now_add=True)
    description = models.TextField(null=True)
    researcher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='Researcher'
    )
    libraries = models.ManyToManyField(Library, blank=True)
    samples = models.ManyToManyField(Sample, blank=True)
    deep_seq_request = models.ForeignKey(
        FileDeepSeqRequest,
        verbose_name='Deep Sequencing Request',
        blank=True,
        null=True,
    )

    def __str__(self):
        return '%s' % self.name


class RequestForm(ModelForm):
    class Meta:
        model = Request
        fields = ('description',)
