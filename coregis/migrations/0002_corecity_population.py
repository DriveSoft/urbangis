# Generated by Django 3.1.7 on 2021-05-03 11:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('coregis', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='corecity',
            name='population',
            field=models.PositiveIntegerField(default=0),
            preserve_default=False,
        ),
    ]
