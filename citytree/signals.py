from django.dispatch import receiver

from django.core.signals import request_finished
from django.db.models.signals import post_save, post_delete



@receiver(post_save)
def my_callback(sender, **kwargs):
    print("post_save")


@receiver(post_delete)
def my_callback(sender, **kwargs):
    print("post_delete")