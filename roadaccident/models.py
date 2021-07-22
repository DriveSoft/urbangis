from django.db import models
from django.shortcuts import reverse
from django.contrib.auth.models import User

from coregis.models import coreCity


class City(coreCity):
    class Meta:
        proxy = True

    def __str__(self):
        return self.sysname

    def get_absolute_url(self):
        return reverse('roadaccident_map_url', kwargs={'city_name': self.sysname})




class Maneuver(models.Model):
    maneuvername = models.CharField(max_length=50) # right, left, ahead, backward

    def __str__(self):
        return self.maneuvername


class TypeViolation(models.Model):
    violationname = models.CharField(max_length=50) #Red light running, Priority traffic sign, Lost control vehicle, Alcohol or drug

    def __str__(self):
        return self.violationname


class Violator(models.Model):
    violatorname = models.CharField(max_length=50) #Driver, Motorcyclist, Cyclist, Pedestrian

    def __str__(self):
        return self.violatorname




class Accident(models.Model):

    class Meta:
        permissions = [
            ("can_change_not_own_accident_record", "Can change the records that do not belong to current user"),
            ("can_delete_not_own_accident_record", "Can delete the records that do not belong to current user"),
        ]

    city = models.ForeignKey(City, on_delete=models.PROTECT)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    datetime = models.DateTimeField()

    maneuver = models.ForeignKey(Maneuver, null=True, blank=True, on_delete=models.PROTECT)
    description = models.TextField(blank=True, default='')

    violations_type = models.ManyToManyField('TypeViolation', blank=True, related_name='accidents')
    violators = models.ManyToManyField('Violator', blank=True, related_name='accidents')

    drivers_injured = models.PositiveSmallIntegerField(default=0)
    motorcyclists_injured = models.PositiveSmallIntegerField(default=0)
    cyclists_injured = models.PositiveSmallIntegerField(default=0)
    ped_injured = models.PositiveSmallIntegerField(default=0)
    kids_injured = models.PositiveSmallIntegerField(default=0)
    pubtr_passengers_injured = models.PositiveSmallIntegerField(default=0)

    drivers_killed = models.PositiveSmallIntegerField(default=0)
    motorcyclists_killed = models.PositiveSmallIntegerField(default=0)
    cyclists_killed = models.PositiveSmallIntegerField(default=0)
    ped_killed = models.PositiveSmallIntegerField(default=0)
    kids_killed = models.PositiveSmallIntegerField(default=0)
    pubtr_passengers_killed = models.PositiveSmallIntegerField(default=0)

    public_transport_involved = models.BooleanField(default=False)

    useradded = models.ForeignKey(User, on_delete=models.PROTECT, related_name='accidents')  # тот кто добавил запись
    is_deleted = models.BooleanField(default=False)


    def __str__(self):
        return str(self.latitude)



