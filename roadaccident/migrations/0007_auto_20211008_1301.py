# Generated by Django 3.1.7 on 2021-10-08 10:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('roadaccident', '0006_auto_20210514_1416'),
    ]

    operations = [
        migrations.AddField(
            model_name='accident',
            name='violations_type_list',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='accident',
            name='violators_list',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
