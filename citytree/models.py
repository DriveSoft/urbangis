from django.db import models
from django.shortcuts import reverse
from django.contrib.auth.models import User

from coregis.models import coreCity

from django.dispatch import receiver

from django.db.models.signals import post_save, post_delete, m2m_changed

from django.conf import settings as djangoSettings



class City(coreCity):
    class Meta:
        proxy = True

    def __str__(self):
        return self.sysname

    def get_absolute_url(self):
        return reverse('citytree_map_url', kwargs={'city_name': self.sysname})



class TypeSpec(models.Model):# тип дерева, лиственные, хвойные, другие
    typename = models.CharField(max_length=255)

    def __str__(self):
        return self.typename


class GroupSpec(models.Model):# чтобы группировать виды, например: Частовстречающиеся, Реже встречающиеся, Остальные
    groupname = models.CharField(max_length=255)
    pos = models.PositiveSmallIntegerField() # чтобы задавать порядок группы

    def __str__(self):
        return self.groupname


class Species(models.Model):# виды деревьев
    speciesname = models.CharField(max_length=255)
    localname = models.CharField(max_length=255, blank=True, null=True)
    typespec = models.ForeignKey(TypeSpec, on_delete=models.PROTECT)
    groupspec = models.ForeignKey(GroupSpec, on_delete=models.PROTECT)
    description = models.TextField(blank=True, null=True)
    requirement = models.TextField(blank=True, null=True)
    urlinfo = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.speciesname


class PlaceType(models.Model):# ()тип места, возможно лучше будет сделать отдельную таблицу с регионами, чтобы определять в каком типе места находится дерево
    placename = models.CharField(max_length=255)

    def __str__(self):
        return self.placename


class IrrigationMethod(models.Model):# метод полива, например если есть автоматическая система, можно создать таблицу с регионами, где есть автополив например
    irrigationname = models.CharField(max_length=255)

    def __str__(self):
        return self.irrigationname


class Status(models.Model):# оцена состояния дерева: новозасадено, в перфектно състояние, в добро състояние със сухи клони (под 20%), Задоволително - със сухи клони 20-50%, в лошо състояние - сухи клони над 50%, мъртво
    statusname = models.CharField(max_length=100)
    hexcolor = models.CharField(max_length=6, default="008000")

    def __str__(self):
        return self.statusname


class CareType(models.Model):#виды мороприятий: без рекомендаций, резитба за повдигане на короната, резитба за прореждане, резитба за премахване на сухи и повредени клони, премахване, преместване
    carename = models.CharField(max_length=100)

    def __str__(self):
        return self.carename


class Remark(models.Model):#замечания: Trunk damaged, Roots damaged, Leaning tree, Hollow, Sick (Sidewalk damage)
    remarkname = models.CharField(max_length=100)

    def __str__(self):
        return self.remarkname



class Tree(models.Model):

    class Meta:
        permissions = [
            ("can_change_not_own_tree_record", "Can change the records that do not belong to current user"),
            ("can_delete_not_own_tree_record", "Can delete the records that do not belong to current user"),
        ]

    city = models.ForeignKey(City, on_delete=models.PROTECT)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    datetimeadded = models.DateTimeField(auto_now_add=True) # дата добавления записи
    useradded = models.ForeignKey(User, on_delete=models.PROTECT, related_name='useradded') # тот кто добавил запись
    is_moderated = models.BooleanField(default=False) # для пользователей с режимом модерации, чтобы модератор мог одобрять
    usermoderated = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True, related_name='usermoderated') # тот кто одобрил запись
    dateplanted = models.DateField(blank=True, null=True) # to be filled in if the planting date is known
    species = models.ForeignKey(Species, on_delete=models.PROTECT)
    speciescomment = models.CharField(max_length=255, blank=True, default='') # if specific name is unknown, user can fill this field, затем админ или модератор мог бы добавить  даннй вид дерево в словарь
    comment = models.TextField(blank=True, default='')
    googlestreeturl = models.CharField(max_length=1024, blank=True, default='')
    is_reservedplace = models.BooleanField(default=False) # если запись указывает о месте, где дерева нету но можно посадить
    placetype = models.ForeignKey(PlaceType, on_delete=models.PROTECT) # улица, пешеходна зона, открытое пространство/пакр, частная территория
    irrigationmethod = models.ForeignKey(IrrigationMethod, on_delete=models.PROTECT, default=1) # метод полива, не нужен, вручную, авто

    lastinsp_datetime = models.DateTimeField(blank=True, null=True)
    lastinsp_comment = models.TextField(blank=True, null=True)
    lastinsp_crowndiameter = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    lastinsp_trunkgirth = models.PositiveSmallIntegerField(blank=True, null=True)
    lastinsp_height = models.PositiveSmallIntegerField(blank=True, null=True)
    lastinsp_status = models.ForeignKey(Status, on_delete=models.PROTECT, blank=True, null=True)
    lastinsp_photo1 = models.ImageField(upload_to='images_tree', blank=True)
    lastinsp_photo2 = models.ImageField(upload_to='images_tree', blank=True)
    lastinsp_photo3 = models.ImageField(upload_to='images_tree', blank=True)

    lastinsp_remarks = models.ManyToManyField('Remark', blank=True, related_name='trees')
    lastinsp_recommendations = models.ManyToManyField('CareType', blank=True, related_name='trees')
    # для оптимизации, чтобы быстро выдавать geojson объект в template
    lastinsp_remarks_list = models.CharField(max_length=100, blank=True, null=True)
    lastinsp_recommendations_list = models.CharField(max_length=100, blank=True, null=True)
    lastinsp_remarks_text = models.CharField(max_length=100, blank=True, null=True)
    lastinsp_recommendations_text = models.CharField(max_length=100, blank=True, null=True)

    # средство для оптимизации загрузки маркеров на карту. Из базы выбираются на карту только записи с is_geojsoned = False,
    # при экспорте в geojson всем существующим записям присваивается is_geojsoned = True
    # т.о. из базы дергаются маркеры на карту только новые.
    # т.е. сперва загружается локальный geojson, только затем из маркеры из базы у которых is_geojsoned = False
    is_geojsoned = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    #@property
    #def latest_inspection(self):
    #    inspectRecord = self.inspection_set.order_by('-datetime')
    #    if inspectRecord:
    #        return inspectRecord[0]
    #    else:
    #        return 0


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'citytree/images_tree/user_{0}/{1}'.format(instance.user.id, filename)


class Inspection(models.Model):

    class Meta:
        permissions = [
            ("can_change_not_own_insp_record", "Can change the records that do not belong to current user"),
            ("can_delete_not_own_insp_record", "Can delete the records that do not belong to current user"),
        ]

    tree = models.ForeignKey(Tree, on_delete=models.CASCADE)
    datetime = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    comment = models.TextField(blank=True, default='')
    crowndiameter = models.DecimalField(max_digits=3, decimal_places=1)
    trunkgirth = models.PositiveSmallIntegerField()
    height = models.PositiveSmallIntegerField()
    status = models.ForeignKey(Status, on_delete=models.PROTECT)
    remarks = models.ManyToManyField('Remark', blank=True, related_name='inspections')
    recommendations = models.ManyToManyField('CareType', blank=True, related_name='inspections')
    photo1 = models.ImageField(upload_to=user_directory_path, max_length=254, blank=True)
    photo2 = models.ImageField(upload_to=user_directory_path, max_length=255, blank=True)
    photo3 = models.ImageField(upload_to=user_directory_path, max_length=255, blank=True)
    #photo1 = models.ImageField(upload_to='citytree/images_tree', blank=True)
    #photo2 = models.ImageField(upload_to='citytree/images_tree', blank=True)
    #photo3 = models.ImageField(upload_to='citytree/images_tree', blank=True)




class CareActivity(models.Model):

    class Meta:
        permissions = [
            ("can_change_not_own_action_record", "Can change the records that do not belong to current user"),
            ("can_delete_not_own_action_record", "Can delete the records that do not belong to current user"),
        ]

    tree = models.ForeignKey(Tree, on_delete=models.CASCADE)
    date = models.DateField()
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    comment = models.TextField(blank=True, null=True)
    executor = models.CharField(max_length=100, blank=True, null=True)
    actions = models.ManyToManyField('CareType', blank=True, related_name='careactivity')












# сигнал, выполняется при сохранении инспекции (при создании и редактировании), выбираем последнюю инспекцию для дерева и заносим ее в модель Tree
@receiver(post_save, sender=Inspection)
def Signal_after_save_Inspection(sender, **kwargs):
    obj_insp = kwargs.get('instance')
    latestInsp = Inspection.objects.filter(tree_id=obj_insp.tree_id).order_by('-datetime')
    #print('signal')
    if latestInsp:
        latestInsp = latestInsp[0]
        obj_tree = Tree.objects.get(id=latestInsp.tree_id)
        obj_tree.lastinsp_datetime = latestInsp.datetime
        obj_tree.lastinsp_comment = latestInsp.comment
        obj_tree.lastinsp_crowndiameter = latestInsp.crowndiameter
        obj_tree.lastinsp_trunkgirth = latestInsp.trunkgirth
        obj_tree.lastinsp_height = latestInsp.height
        obj_tree.lastinsp_status = latestInsp.status
        obj_tree.lastinsp_photo1 = latestInsp.photo1
        obj_tree.lastinsp_photo2 = latestInsp.photo2
        obj_tree.lastinsp_photo3 = latestInsp.photo3
        obj_tree.is_geojsoned = False
        obj_tree.save()



# сигнал при удалении инспеции, если инспекций больше нет, то обнуляем все поля, если есть, то присваиваем в объект Tree последнюю инспекцию
@receiver(post_delete, sender=Inspection)
def Signal_after_delete_Inspection(sender, **kwargs):
    obj_insp = kwargs.get('instance')
    latestInsp = Inspection.objects.filter(tree_id=obj_insp.tree_id).order_by('-datetime')

    if latestInsp:
        latestInsp = latestInsp[0]
        obj_tree = Tree.objects.get(id=latestInsp.tree_id)
        obj_tree.lastinsp_datetime = latestInsp.datetime
        obj_tree.lastinsp_comment = latestInsp.comment
        obj_tree.lastinsp_crowndiameter = latestInsp.crowndiameter
        obj_tree.lastinsp_trunkgirth = latestInsp.trunkgirth
        obj_tree.lastinsp_height = latestInsp.height
        obj_tree.lastinsp_status = latestInsp.status
        obj_tree.lastinsp_photo1 = latestInsp.photo1
        obj_tree.lastinsp_photo2 = latestInsp.photo2
        obj_tree.lastinsp_photo3 = latestInsp.photo3

        obj_remarks = latestInsp.remarks.all()
        obj_tree.lastinsp_remarks.set(obj_remarks)
        # в поле lastinsp_remarks_list сохраняет список в текстовом виде: "1", "3", для более быстрого формирования geojson
        s = ''
        for item in obj_remarks:
            s = s + '"' + str(item.id) + '",'
        obj_tree.lastinsp_remarks_list = s

        obj_recommends = latestInsp.recommendations.all()
        obj_tree.lastinsp_recommendations.set(obj_recommends)
        # в поле lastinsp_recommendations_list сохраняет список в текстовом виде: "1", "3", для более быстрого формирования geojson
        s = ''
        for item in obj_recommends:
            s = s + '"' + str(item.id) + '",'
        obj_tree.lastinsp_recommendations_list = s

        obj_tree.save()
    else: # если у дерева больше нет инспекций, все поля обнуляем
        obj_tree = Tree.objects.get(id=obj_insp.tree_id)
        obj_tree.lastinsp_datetime = None
        obj_tree.lastinsp_comment = None
        obj_tree.lastinsp_crowndiameter = None
        obj_tree.lastinsp_trunkgirth = None
        obj_tree.lastinsp_height = None
        obj_tree.lastinsp_status = None
        obj_tree.lastinsp_photo1.delete()
        obj_tree.lastinsp_photo2.delete()
        obj_tree.lastinsp_photo3.delete()

        obj_tree.lastinsp_remarks.clear()
        obj_tree.lastinsp_recommendations.clear()
        obj_tree.lastinsp_remarks_list = None
        obj_tree.lastinsp_recommendations_list = None
        obj_tree.lastinsp_remarks_text = None
        obj_tree.lastinsp_recommendations_text = None
        obj_tree.save()




# сигнал при изменении в промежуточной модели m2m Inspection_remarks, выбираем последнюю инспекцию для дерева и заносим ее в модель Tree
# необходимо, т.к. сигнал post_save не отслеживает изменения в m2m таблицах
@receiver(m2m_changed)
def Signal_m2m(sender, **kwargs):
    instance = kwargs.get('instance')
    #reverse = kwargs.get('reverse')
    model = kwargs.get('model')
    pk_set = kwargs.get('pk_set')
    action = kwargs.get('action')
    # если изменение произошло в промежуточной таблице Inspection_remarks, и если это добавление или удаление в промежуточной таблице
    if sender == Inspection.remarks.through and (action == 'post_add' or action == 'post_remove') and model == Remark:
        latestInsp = Inspection.objects.filter(tree_id=instance.tree_id).order_by('-datetime')
        if latestInsp:
            latestInsp = latestInsp[0]
            obj_tree = Tree.objects.get(id=latestInsp.tree_id)
            obj_remarks = latestInsp.remarks.all()
            obj_tree.lastinsp_remarks.clear()
            obj_tree.lastinsp_remarks.set(obj_remarks)
            # в поле lastinsp_remarks_list сохраняет список в текстовом виде: "1", "3", для более быстрого формирования geojson
            s = ''
            for item in obj_remarks:
                s = s + '"' + str(item.id)+'",'
            s = s[:-1]
            obj_tree.lastinsp_remarks_list = s
            obj_tree.save()

    if sender == Inspection.recommendations.through and (action == 'post_add' or action == 'post_remove') and model == CareType:
        latestInsp = Inspection.objects.filter(tree_id=instance.tree_id).order_by('-datetime')
        if latestInsp:
            latestInsp = latestInsp[0]
            obj_tree = Tree.objects.get(id=latestInsp.tree_id)
            obj_recommends = latestInsp.recommendations.all()
            obj_tree.lastinsp_recommendations.clear()
            obj_tree.lastinsp_recommendations.set(obj_recommends)
            # в поле lastinsp_recommendations_list сохраняет список в текстовом виде: "1", "3", для более быстрого формирования geojson
            s = ''
            for item in obj_recommends:
                s = s + '"' + str(item.id)+'",'
            s = s[:-1]
            obj_tree.lastinsp_recommendations_list = s
            obj_tree.save()



    #print(sender)    #<class 'citytree.models.Inspection_remarks'>
    #print(instance)  #Inspection object (2064)
    #print(reverse)   #False
    #print(model)     #<class 'citytree.models.Remark'>
    #print(pk_set)    #{2, 3}
    #print(action)    # pre_add, post_add


