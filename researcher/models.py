from django.db import models


class Researcher(models.Model):
    first_name = models.CharField('First name', max_length=150)
    last_name = models.CharField('Last name', max_length=150)
    telephone = models.CharField('Telephone', max_length=100)
    email = models.CharField('Email', max_length=100)
    pi = models.CharField('Principal Investigator', max_length=150)
    organization = models.CharField('Organization', max_length=200)
    costunit = models.CharField('Cost Unit', max_length=100)

    def __str__(self):
        return '%s %s (%s)' % (self.first_name, self.last_name, self.organization)
