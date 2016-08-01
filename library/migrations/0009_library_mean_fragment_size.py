# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-08-01 10:03
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0008_library'),
    ]

    operations = [
        migrations.AddField(
            model_name='library',
            name='mean_fragment_size',
            field=models.IntegerField(default=0, verbose_name='Mean Fragment Size'),
            preserve_default=False,
        ),
    ]