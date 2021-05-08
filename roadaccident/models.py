from django.db import models
from django.shortcuts import reverse

from coregis.models import coreCity


class City(coreCity):
    class Meta:
        proxy = True

    def __str__(self):
        return self.sysname

    def get_absolute_url(self):
        return reverse('roadaccident_map_url', kwargs={'city_name': self.sysname})




class Maneuver(models.Model):
    maneuvername = models.CharField(max_length=50)
    # right, left, ahead, backward
    def __str__(self):
        return self.maneuvername




class Accident(models.Model):
    city = models.ForeignKey(City, on_delete=models.PROTECT)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    datetime = models.DateTimeField()
    description = models.TextField(blank=True)

    red_light_running = models.BooleanField(default=False)
    priority_traffic_sign = models.BooleanField(default=False)
    lost_control_vehicle = models.BooleanField(default=False)

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

    maneuver = models.ForeignKey(Maneuver, null=True, blank=True, on_delete=models.PROTECT)

    driver_violation = models.BooleanField(default=False)
    motorcyclist_violation = models.BooleanField(default=False)
    cyclist_violation = models.BooleanField(default=False)
    pedestrian_violation = models.BooleanField(default=False)

    puplic_transport_involved = models.BooleanField(default=False)
    alcohol_or_drug = models.BooleanField(default=False)

    def __str__(self):
        return str(self.latitude)



