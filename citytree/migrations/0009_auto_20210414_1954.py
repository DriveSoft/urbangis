# Generated by Django 3.1.7 on 2021-04-14 16:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('citytree', '0008_auto_20210414_1639'),
    ]

    operations = [
        migrations.AddField(
            model_name='inspection',
            name='photo1',
            field=models.ImageField(blank=True, upload_to='images_tree'),
        ),
        migrations.AddField(
            model_name='inspection',
            name='photo2',
            field=models.ImageField(blank=True, upload_to='images_tree'),
        ),
        migrations.AddField(
            model_name='inspection',
            name='photo3',
            field=models.ImageField(blank=True, upload_to='images_tree'),
        ),
        migrations.DeleteModel(
            name='InspPhotos',
        ),
    ]
