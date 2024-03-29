# Generated by Django 3.1.7 on 2021-04-23 09:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('citytree', '0015_auto_20210422_1204'),
    ]

    operations = [
        migrations.AddField(
            model_name='tree',
            name='lastinsp_comment',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='tree',
            name='lastinsp_crowndiameter',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=3, null=True),
        ),
        migrations.AddField(
            model_name='tree',
            name='lastinsp_datetime',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='tree',
            name='lastinsp_height',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='tree',
            name='lastinsp_photo1',
            field=models.ImageField(blank=True, upload_to='images_tree'),
        ),
        migrations.AddField(
            model_name='tree',
            name='lastinsp_photo2',
            field=models.ImageField(blank=True, upload_to='images_tree'),
        ),
        migrations.AddField(
            model_name='tree',
            name='lastinsp_photo3',
            field=models.ImageField(blank=True, upload_to='images_tree'),
        ),
        migrations.AddField(
            model_name='tree',
            name='lastinsp_recommendations',
            field=models.ManyToManyField(blank=True, related_name='trees', to='citytree.CareType'),
        ),
        migrations.AddField(
            model_name='tree',
            name='lastinsp_remarks',
            field=models.ManyToManyField(blank=True, related_name='trees', to='citytree.Remark'),
        ),
        migrations.AddField(
            model_name='tree',
            name='lastinsp_status',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='citytree.status'),
        ),
        migrations.AddField(
            model_name='tree',
            name='lastinsp_trunkgirth',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
    ]
