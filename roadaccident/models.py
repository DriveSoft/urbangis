from django.db import models
from django.shortcuts import reverse
from django.contrib.auth.models import User

from django.dispatch import receiver
from django.db.models.signals import m2m_changed

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

    # для оптимизации, чтобы быстро выдавать geojson объект
    violations_type_list = models.CharField(max_length=100, blank=True, null=True)    
    violators_list = models.CharField(max_length=100, blank=True, null=True) 


    def __str__(self):
        return str(self.latitude)





@receiver(m2m_changed)
def Signal_m2m(sender, **kwargs):
    instance = kwargs.get('instance') # gets Accident instance
    model = kwargs.get('model')
    #pk_set = kwargs.get('pk_set')
    action = kwargs.get('action')  

    if model == Violator and sender == Accident.violators.through and (action == 'post_add' or action == 'post_remove'):
        obj_violators = instance.violators.all()
        s = ''
        for item in obj_violators:
            s = s + '"' + str(item.id) + '",'
        
        s = s.rstrip(',')
        instance.violators_list = s        
        instance.save()     


    if model == TypeViolation and sender == Accident.violations_type.through and (action == 'post_add' or action == 'post_remove'):
        obj_violations_type = instance.violations_type.all()
        s = ''
        for item in obj_violations_type:
            s = s + '"' + str(item.id) + '",'
        
        s = s.rstrip(',')
        instance.violations_type_list = s        
        instance.save()          

  


  