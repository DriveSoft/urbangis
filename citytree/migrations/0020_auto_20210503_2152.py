# Generated by Django 3.1.7 on 2021-05-03 18:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('citytree', '0019_auto_20210428_1645'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='careactivity',
            options={'permissions': [('can_change_not_own_action_record', 'Can change the records that do not belong to current user'), ('can_delete_not_own_action_record', 'Can delete the records that do not belong to current user')]},
        ),
        migrations.AlterModelOptions(
            name='inspection',
            options={'permissions': [('can_change_not_own_insp_record', 'Can change the records that do not belong to current user'), ('can_delete_not_own_insp_record', 'Can delete the records that do not belong to current user')]},
        ),
        migrations.AlterModelOptions(
            name='tree',
            options={'permissions': [('can_change_not_own_tree_record', 'Can change the records that do not belong to current user'), ('can_delete_not_own_tree_record', 'Can delete the records that do not belong to current user')]},
        ),
    ]
