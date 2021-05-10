# Generated by Django 3.1.7 on 2021-04-19 20:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('citytree', '0012_remove_tree_irrigationneed'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tree',
            name='irrigationmethod',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, to='citytree.irrigationmethod'),
        ),
    ]