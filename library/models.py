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


class IndexType(models.Model):
    name = models.CharField('Index Type', max_length=200)

    def __str__(self):
        return self.name


class Index(models.Model):
    index_id = models.CharField('Index ID', max_length=50)
    index = models.CharField('Index', max_length=200)
    index_type = models.ForeignKey(IndexType, verbose_name='Index Type')

    class Meta:
        abstract = True

    def __str__(self):
        return self.index_id


class IndexI7(Index):
    pass


class IndexI5(Index):
    pass


class ConcentrationMethod(models.Model):
    name = models.CharField('Name', max_length=200)

    def __str__(self):
        return self.name


class SequencingRunCondition(models.Model):
    name = models.CharField('Name', max_length=200)

    def __str__(self):
        return self.name
