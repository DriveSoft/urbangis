# Generated by Django 3.1.7 on 2021-05-06 11:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('citytree', '0024_species_localname'),
    ]

    operations = [
        migrations.AddField(
            model_name='species',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='species',
            name='requirement',
            field=models.TextField(blank=True, null=True),
        ),
    ]
