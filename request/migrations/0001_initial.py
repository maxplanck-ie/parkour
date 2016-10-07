# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-07 13:00
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('library', '0014_barcodecounter'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Request',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.IntegerField(default=0)),
                ('name', models.CharField(blank=True, max_length=100, verbose_name='Name')),
                ('date_created', models.DateTimeField(auto_now_add=True, verbose_name='Date')),
                ('description', models.TextField(null=True)),
                ('libraries', models.ManyToManyField(blank=True, to='library.Library')),
                ('researcher', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Researcher')),
                ('samples', models.ManyToManyField(blank=True, to='library.Sample')),
            ],
        ),
    ]
