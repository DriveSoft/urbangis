# Generated by Django 3.1.7 on 2021-07-15 11:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('urbanobject', '0002_radiustransportmode'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='urbanobject',
            options={'permissions': [('can_change_not_own_object_record', 'Can change the records that do not belong to current user'), ('can_delete_not_own_object_record', 'Can delete the records that do not belong to current user')]},
        ),
    ]
