# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-10-31 13:22
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0015_library_is_pooled'),
    ]

    operations = [
        migrations.AlterField(
            model_name='indexi5',
            name='index_id',
            field=models.CharField(max_length=50, unique=True, verbose_name='Index ID'),
        ),
        migrations.AlterField(
            model_name='indexi7',
            name='index_id',
            field=models.CharField(max_length=50, unique=True, verbose_name='Index ID'),
        ),
    ]
