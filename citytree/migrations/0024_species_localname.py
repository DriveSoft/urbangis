# Generated by Django 3.1.7 on 2021-05-06 11:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('citytree', '0023_species_typespec'),
    ]

    operations = [
        migrations.AddField(
            model_name='species',
            name='localname',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]