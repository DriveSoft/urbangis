# Generated by Django 3.1.7 on 2021-04-18 10:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('citytree', '0009_auto_20210414_1954'),
    ]

    operations = [
        migrations.RenameField(
            model_name='inspection',
            old_name='trunkdiameter',
            new_name='trunkgirth',
        ),
    ]
