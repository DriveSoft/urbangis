# Generated by Django 3.1.7 on 2021-05-13 09:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('roadaccident', '0003_auto_20210512_1557'),
    ]

    operations = [
        migrations.AlterField(
            model_name='accident',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
    ]