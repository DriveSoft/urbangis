from django.db import models
from django.shortcuts import reverse
from coregis.models import *



class RadiusTransportMode(models.Model):
    radius = models.PositiveSmallIntegerField()
    description = models.CharField(max_length=50, blank=True, default='')

    def __str__(self):
        return self.description


class City(coreCity):
    class Meta:
        proxy = True

    def __str__(self):
        return self.sysname

    def get_absolute_url(self):
        return reverse('urbanobject_map_url', kwargs={'city_name': self.sysname})





class catObject(coreCatObject):
    class Meta:
        proxy = True

    def __str__(self):
        return self.catname


class subcatObject(coreSubcatObject):
    class Meta:
        proxy = True

    def __str__(self):
        return self.subcatname


class urbanObject(coreUrbanObject):
    class Meta:
        proxy = True

    def __str__(self):
        return self.latitude


class urbanObjectPolygon(coreUrbanObjectPolygon):
    class Meta:
        proxy = True

    def __str__(self):
        return self.latitude