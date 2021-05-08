# Generated by Django 3.1.7 on 2021-04-08 09:21

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('coregis', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CareType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('carename', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='IrrigationMethod',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('irrigationname', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='PlaceType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('placename', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Species',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('speciesname', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Status',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('statusname', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='City',
            fields=[
            ],
            options={
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('coregis.corecity',),
        ),
        migrations.CreateModel(
            name='Tree',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('datetimeadded', models.DateTimeField(auto_now_add=True)),
                ('is_moderated', models.BooleanField(default=False)),
                ('dateplanted', models.DateField(blank=True)),
                ('speciescomment', models.CharField(max_length=255)),
                ('comment', models.TextField(blank=True)),
                ('googlestreeturl', models.CharField(max_length=1024)),
                ('is_reservedplace', models.BooleanField(default=False)),
                ('irrigationneed', models.BooleanField(default=False)),
                ('city', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='citytree.city')),
                ('irrigationmethod', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='citytree.irrigationmethod')),
                ('placetype', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='citytree.placetype')),
                ('species', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='citytree.species')),
                ('useradded', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='useradded', to=settings.AUTH_USER_MODEL)),
                ('usermoderated', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='usermoderated', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Inspection',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('datetime', models.DateTimeField()),
                ('comment', models.TextField(blank=True)),
                ('crowndiameter', models.DecimalField(decimal_places=1, max_digits=3)),
                ('trunkdiameter', models.DecimalField(decimal_places=2, max_digits=3)),
                ('height', models.PositiveSmallIntegerField()),
                ('trunkdamage', models.BooleanField(default=False)),
                ('rootsdamage', models.BooleanField(default=False)),
                ('leaningtree', models.BooleanField(default=False)),
                ('hollow', models.BooleanField(default=False)),
                ('sick', models.BooleanField(default=False)),
                ('recommendations', models.ManyToManyField(blank=True, related_name='inspections', to='citytree.CareType')),
                ('status', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='citytree.status')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='CareActivity',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('comment', models.TextField(blank=True)),
                ('executor', models.CharField(max_length=100)),
                ('actions', models.ManyToManyField(blank=True, related_name='careactivity', to='citytree.CareType')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
