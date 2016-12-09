# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-07-25 12:08
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('common', '0002_load_initial_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='LibraryProtocol',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Protocol')),
                ('provider', models.CharField(max_length=150, verbose_name='Provider')),
            ],
        ),
        migrations.CreateModel(
            name='LibraryType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Type')),
                ('library_protocol', models.ManyToManyField(to='library.LibraryProtocol', verbose_name='Library Protocol')),
            ],
        ),
        migrations.CreateModel(
            name='Organism',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Organism')),
            ],
        ),
    ]