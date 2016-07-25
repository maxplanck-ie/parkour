from django.db import models


class LibraryProtocol(models.Model):
    name = models.CharField('Protocol', max_length=200)
    provider = models.CharField('Provider', max_length=150)

    def __str__(self):
        return self.name


class LibraryType(models.Model):
    name = models.CharField('Type', max_length=200)
    library_protocol = models.ManyToManyField(LibraryProtocol, verbose_name='Library Protocol')

    def __str__(self):
        return self.name


class Organism(models.Model):
    name = models.CharField('Organism', max_length=200)

    def __str__(self):
        return self.name
