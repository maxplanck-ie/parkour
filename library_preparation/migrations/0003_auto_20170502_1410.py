# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-05-02 12:10
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('library_preparation', '0002_remove_librarypreparation_file'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='librarypreparation',
            name='ul_buffer',
        ),
        migrations.RemoveField(
            model_name='librarypreparation',
            name='ul_sample',
        ),
    ]