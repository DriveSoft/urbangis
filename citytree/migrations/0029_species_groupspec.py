# Generated by Django 3.1.7 on 2021-05-07 13:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('citytree', '0028_groupspec'),
    ]

    operations = [
        migrations.AddField(
            model_name='species',
            name='groupspec',
            field=models.ForeignKey(default=3, on_delete=django.db.models.deletion.PROTECT, to='citytree.groupspec'),
            preserve_default=False,
        ),
    ]
