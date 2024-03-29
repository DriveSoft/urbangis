# Generated by Django 3.1.7 on 2021-07-08 10:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('coregis', '0005_catobject_subcatobject_urbanobject_urbanobjectpolygon'),
    ]

    operations = [
        migrations.CreateModel(
            name='coreUrbanObject',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('comment', models.TextField(blank=True, default='')),
            ],
        ),
        migrations.RenameModel(
            old_name='catObject',
            new_name='coreCatObject',
        ),
        migrations.RenameModel(
            old_name='subcatObject',
            new_name='coreSubcatObject',
        ),
        migrations.RenameModel(
            old_name='urbanObjectPolygon',
            new_name='coreUrbanObjectPolygon',
        ),
        migrations.DeleteModel(
            name='urbanObject',
        ),
        migrations.AddField(
            model_name='coreurbanobject',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='coregis.corecatobject'),
        ),
        migrations.AddField(
            model_name='coreurbanobject',
            name='city',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='coregis.corecity'),
        ),
        migrations.AddField(
            model_name='coreurbanobject',
            name='subcategories',
            field=models.ManyToManyField(blank=True, related_name='coreUrbanObjects', to='coregis.coreSubcatObject'),
        ),
        migrations.AlterField(
            model_name='coreurbanobjectpolygon',
            name='object',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='coregis.coreurbanobject'),
        ),
    ]
