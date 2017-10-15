from django.db import models
from authtools.models import AbstractEmailUser


class Organization(models.Model):
    name = models.CharField('Organization', max_length=200)

    def __str__(self):
        return self.name


class PrincipalInvestigator(models.Model):
    name = models.CharField('Principal Investigator', max_length=150)
    organization = models.ForeignKey(Organization)

    class Meta:
        # verbose_name = 'Principal Investigator'
        # verbose_name_plural = 'Principal Investigators'
        ordering = ['name']

    def __str__(self):
        return '%s (%s)' % (self.name, self.organization.name)


class CostUnit(models.Model):
    name = models.CharField('Cost Unit', max_length=150)
    pi = models.ForeignKey(
        PrincipalInvestigator,
        verbose_name='Principal Investigator',
    )

    class Meta:
        # verbose_name = 'Cost Unit'
        # verbose_name_plural = 'Cost Units'
        ordering = ['name']

    def __str__(self):
        return '{} ({}: {})'.format(
            self.name,
            self.pi.organization.name,
            self.pi.name,
        )


class User(AbstractEmailUser):
    first_name = models.CharField('First name', max_length=50)
    last_name = models.CharField('Last name', max_length=50)
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
        ordering = ['last_name', 'first_name']

    def get_full_name(self):
        return '{} {}'.format(self.first_name, self.last_name)

    def __str__(self):
        return '{} {} ({})'.format(self.first_name, self.last_name, self.email)


class DateTimeMixin(models.Model):
    create_time = models.DateTimeField('Create Time', auto_now_add=True)
    update_time = models.DateTimeField('Update Time', auto_now=True)

    class Meta:
        abstract = True
