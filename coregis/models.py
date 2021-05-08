from django.db import models

class coreCity(models.Model):
    cityname = models.CharField(max_length=50, unique=True)
    sysname = models.CharField(max_length=50, unique=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    zoom = models.SmallIntegerField()
    population = models.PositiveIntegerField()
