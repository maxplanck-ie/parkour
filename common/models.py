from django.db import models
from authtools.models import AbstractNamedUser


class Organization(models.Model):
    name = models.CharField('Organization', max_length=200)

    def __str__(self):
        return self.name


class PrincipalInvestigator(models.Model):
    name = models.CharField('Principal Investigator', max_length=150)
    organization = models.ForeignKey(Organization)

    def __str__(self):
        return '%s (%s)' % (self.name, self.organization.name)


class CostUnit(models.Model):
    name = models.CharField('Cost Unit', max_length=150)
    pi = models.ForeignKey(
        PrincipalInvestigator,
        verbose_name='Principal Investigator',
    )

    def __str__(self):
        return '%s (%s: %s)' % (
            self.name,
            self.pi.organization.name,
            self.pi.name,
        )


class User(AbstractNamedUser):
    phone = models.CharField('Phone', max_length=100, null=True, blank=True)
    organization = models.ForeignKey(
        Organization,
        verbose_name='Organization',
        null=True,
        blank=True,
        default=None,
    )
    pi = models.ForeignKey(
        PrincipalInvestigator,
        verbose_name='Principal Investigator',
        null=True,
        blank=True,
        default=None,
    )
    cost_unit = models.ManyToManyField(
        CostUnit,
        verbose_name='Cost Unit',
        blank=True,
    )

    class Meta:
        db_table = 'auth_user'
