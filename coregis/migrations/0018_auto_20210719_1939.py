# Generated by Django 3.1.7 on 2021-07-19 16:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('coregis', '0017_auto_20210719_1251'),
    ]

    operations = [
        migrations.AlterField(
            model_name='corecatobject',
            name='markercolor',
            field=models.CharField(default='000000', max_length=8),
        ),
    ]
