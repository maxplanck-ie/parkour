from django.db import models


class Organization(models.Model):
    name = models.CharField('Organization', max_length=200)

    def __str__(self):
        return self.name


class PrincipalInvestigator(models.Model):
    name = models.CharField('Principal Investigator', max_length=150)
    organization = models.ForeignKey(Organization)

    def __str__(self):
        return self.name


class CostUnit(models.Model):
    name = models.CharField('Cost Unit', max_length=150)
    organization = models.ForeignKey(Organization)

    def __str__(self):
        return self.name


class Researcher(models.Model):
    first_name = models.CharField('First name', max_length=150)
    last_name = models.CharField('Last name', max_length=150)
    telephone = models.CharField('Telephone', max_length=100)
    email = models.CharField('Email', max_length=100)
    organization = models.ForeignKey(Organization, verbose_name='Organization')
    pi = models.ForeignKey(PrincipalInvestigator, verbose_name='Principal Investigator')
    cost_unit = models.ManyToManyField(CostUnit, verbose_name='Cost Unit')

    def __str__(self):
        return '%s %s (%s)' % (self.first_name, self.last_name, self.organization)
