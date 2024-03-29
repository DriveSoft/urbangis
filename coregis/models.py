from django.db import models
from django.contrib.auth.models import User

from django.dispatch import receiver
from django.db.models.signals import m2m_changed



class coreCity(models.Model):
    cityname = models.CharField(max_length=50, unique=True)
    sysname = models.CharField(max_length=50, unique=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    zoom = models.SmallIntegerField()
    population = models.PositiveIntegerField()

    def __str__(self):
        return self.sysname

    @property
    def count_trees(self):
        return self.tree_set.filter(is_deleted=False).count()

    @property
    def count_accidents(self):
        return self.accident_set.filter(is_deleted=False).count()        

    @property
    def count_urbanobjects(self):
        return self.coreurbanobject_set.filter(is_deleted=False).count()




class coreCatObject(models.Model):
    catname = models.CharField(max_length=50, unique=True)
    icon = models.CharField(max_length=50, default='object_unknown')
    markercolor = models.CharField(max_length=8, default="000000")

    def __str__(self):
        return self.catname

class coreSubcatObject(models.Model):
    subcatname = models.CharField(max_length=50)
    category = models.ForeignKey(coreCatObject, on_delete=models.CASCADE, related_name='subcats')
    comment = models.CharField(max_length=50, blank=True, default='')

    def __str__(self):
        return self.subcatname

class coreUrbanObject(models.Model):
    class Meta:
        permissions = [
            ("can_change_not_own_object_record", "Can change the records that do not belong to current user"),
            ("can_delete_not_own_object_record", "Can delete the records that do not belong to current user"),
        ]

    city = models.ForeignKey(coreCity, on_delete=models.PROTECT)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    category = models.ForeignKey(coreCatObject, on_delete=models.PROTECT)
    subcategories = models.ManyToManyField('coreSubcatObject', blank=True, related_name='urbanobjects')
    description = models.CharField(max_length=255, blank=True, default='')
    comment = models.TextField(blank=True, default='')
    googlestreeturl = models.CharField(max_length=1024, blank=True, default='')
    rating = models.SmallIntegerField(blank=True, default=0)
    photo1 = models.ImageField(max_length=255, blank=True)
    photo2 = models.ImageField(max_length=255, blank=True)
    photo3 = models.ImageField(max_length=255, blank=True)
    useradded = models.ForeignKey(User, on_delete=models.PROTECT, related_name='urbanobjects')  # тот кто добавил запись
    datetimeadded = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    
    # для оптимизации, чтобы быстро выдавать geojson объект
    subcategories_list = models.CharField(max_length=100, blank=True, null=True)       


class coreUrbanObjectPolygon(models.Model):
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    object = models.ForeignKey(coreUrbanObject, on_delete=models.CASCADE)




@receiver(m2m_changed)
def Signal_m2m(sender, **kwargs):
    instance = kwargs.get('instance') # gets coreUrbanObject instance
    model = kwargs.get('model')
    #pk_set = kwargs.get('pk_set')
    action = kwargs.get('action')  

    if model == coreSubcatObject and sender == coreUrbanObject.subcategories.through and (action == 'post_add' or action == 'post_remove'):
        obj_subcategories = instance.subcategories.all()
        s = ''
        for item in obj_subcategories:
            s = s + '"' + str(item.id) + '",'
        
        s = s.rstrip(',')
        instance.subcategories_list = s        
        instance.save()  