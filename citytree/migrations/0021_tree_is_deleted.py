# Generated by Django 3.1.7 on 2021-05-03 22:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('citytree', '0020_auto_20210503_2152'),
    ]

    operations = [
        migrations.AddField(
            model_name='tree',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]
