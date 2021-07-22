# Generated by Django 3.1.7 on 2021-04-08 18:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('citytree', '0003_auto_20210408_1354'),
    ]

    operations = [
        migrations.AddField(
            model_name='inspection',
            name='tree',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='citytree.tree'),
            preserve_default=False,
        ),
    ]
