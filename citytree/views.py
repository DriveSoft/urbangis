from django.shortcuts import render, redirect
from django.views.generic import View
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse, HttpResponse
from django.utils.translation import gettext as _
from django.core import serializers
from .forms import *
from .models import *
from .utils import *
import os
from django.conf import settings as djangoSettings

from django.db import transaction

import random
import json
from datetime import *
import gzip
import shutil





class Map(View):
    def get(self, request, city_name):
        obj_city = get_object_or_404(City, sysname__iexact=city_name)

        #tree_data = Tree.objects.filter(city_id=obj_city.id).select_related('lastinsp_status')
        tree_data = Tree.objects.filter(city_id=obj_city.id).filter(is_geojsoned=False).select_related('lastinsp_status').values_list('id', 'latitude', 'longitude', 'datetimeadded', 'useradded_id', 'dateplanted', 'species_id', 'speciescomment', 'comment', 'googlestreeturl', 'placetype_id', 'irrigationmethod_id', 'lastinsp_datetime', 'lastinsp_comment', 'lastinsp_crowndiameter', 'lastinsp_trunkgirth', 'lastinsp_height', 'lastinsp_status', 'lastinsp_status_id', 'lastinsp_photo1', 'lastinsp_photo2', 'lastinsp_photo3', 'lastinsp_remarks_list', 'lastinsp_recommendations_list', 'lastinsp_remarks_text', 'lastinsp_recommendations_text', 'is_deleted', named=True)
        #tree_data = Tree.objects.filter(city_id=obj_city.id).values
        if tree_data.count() > 100: # если в базе более 100 записей, где is_geojsoned=False, тогда делаем снова экспорт в geojson
            citydataToGeoJson(obj_city)

        obj_all_cities = City.objects.all().order_by('-population')
        #species = Species.objects.order_by('speciesname')
        placetype = PlaceType.objects.all()
        irrigationmethod = IrrigationMethod.objects.all()
        caretype = CareType.objects.all()
        status = Status.objects.all()
        remark = Remark.objects.all()

        # делаем список (list) QuerySet-ов отдельно для каждой группы вида деревьев (Часто встречаемые, средневстречаемые, другие)
        species_by_group = []
        obj_groupspec = GroupSpec.objects.all().order_by('pos')
        for itemGroup in obj_groupspec:
            obj_specgroup = Species.objects.filter(groupspec = itemGroup).exclude(id=1).order_by('localname')
            if obj_specgroup.count() > 0:
                species_by_group.append(obj_specgroup)

        formTree = TreeFormNew()
        formInspection = IncpectionFormNew()
        formAction = ActionFormNew()


        context = {'formTree': formTree, 'formInspection': formInspection, 'formAction': formAction, 'obj_all_cities': obj_all_cities,
                   'placetype': placetype, 'obj_city': obj_city, 'irrigationmethod': irrigationmethod,
                   'caretype': caretype, 'status': status, 'remark': remark, 'species_by_group': species_by_group,
                   'tree_data': tree_data, 'lat': request.GET.get('lat'), 'lng': request.GET.get('lng')}

        return render(request, 'citytree/index.html', context=context)


    def post(self, request, city_name):
        if not request.user.is_authenticated:
            return redirect('%s?next=%s' % (reverse('login'), request.path))
        else:
            obj_city = get_object_or_404(City, sysname__iexact=city_name)
            treeId = request.POST.get('treeId')  # получаем id если редактируем

            # edit Tree
            if request.POST.get('send') == 'save':
                if treeId:  # если в accidentId есть id значит редактируем

                    if not request.user.has_perm('citytree.change_tree'):
                        raise PermissionDenied ('You do not have sufficient permissions to change this data.')

                    obj_newtree = get_object_or_404(Tree, pk=treeId)
                    #проверяем, если редактируется не своя запись, имеет ли право ее редактировать
                    if obj_newtree.useradded != request.user and not request.user.has_perm('citytree.can_change_not_own_tree_record'):# and not request.user.is_staff and not request.user.is_superuser:
                        raise PermissionDenied ('You cannot change information about the tree if this tree was added by another user.')

                    bound_form_tree = TreeFormNew(request.POST, instance=obj_newtree)

                    if bound_form_tree.is_valid(): #and bound_form_inspec.is_valid():
                        #print('valid')
                        obj_newtree = bound_form_tree.save(commit=False)
                        obj_newtree.city_id = obj_city.id
                        obj_newtree.is_geojsoned = False #т.к. запись была отредактирана, маркер для нее теперь будет браться из БД, до тех пор, пока не будет сделан повторный экспорт в geojson

                        obj_newtree = bound_form_tree.save()

                        response = redirect(obj_city)
                        response['Location'] += '?lat=' + str(obj_newtree.latitude) + '&lng=' + str(obj_newtree.longitude)
                        return response


                else: # create a new tree
                    if not request.user.has_perm('citytree.add_tree'):
                        raise PermissionDenied ('You do not have enough permissions to create an entry.')
                    obj_newtree = None

                    #print(dir(request.FILES))

                    bound_form_tree = TreeFormNew(request.POST)
                    bound_form_inspec = IncpectionFormNew(request.POST, request.FILES)

                    #print(request.POST.get('recommendations'))

                    if bound_form_tree.is_valid() and bound_form_inspec.is_valid():

                        obj_newtree = bound_form_tree.save(commit=False)
                        obj_newtree.city_id = obj_city.id
                        obj_newtree.useradded = request.user
                        obj_newtree = bound_form_tree.save()

                        obj_newinspec = bound_form_inspec.save(commit=False)
                        obj_newinspec.tree_id = obj_newtree.id
                        obj_newinspec.user = request.user

                        # если файл уже существует в S3, тогда в photo1_newname содержится новое имя файла
                        photo1_newname = request.POST.get('photo1_newname')
                        if photo1_newname:
                            obj_newinspec.photo1.name = photo1_newname

                        photo2_newname = request.POST.get('photo2_newname')
                        if photo2_newname:
                            obj_newinspec.photo2.name = photo2_newname

                        photo3_newname = request.POST.get('photo3_newname')
                        if photo3_newname:
                            obj_newinspec.photo3.name = photo3_newname


                        bound_form_inspec.save()

                        response = redirect(obj_city)
                        response['Location'] += '?lat=' + str(obj_newtree.latitude) + '&lng=' + str(obj_newtree.longitude)
                        return response

                    else:
                        return render(request, 'citytree/index.html', context={'obj_city': obj_city, 'formTree': bound_form_tree, 'formInspection': bound_form_inspec})
                        #return HttpResponse(bound_form.errors)

            elif request.POST.get('send') == 'delete':
                if not request.user.has_perm('citytree.delete_tree'):
                    raise PermissionDenied('You do not have enough permissions to delete the entry.')

                obj_tree = get_object_or_404(Tree, pk=treeId)
                # проверяем, если удаляется не своя запись, имеет ли право ее удалить
                if obj_tree.useradded != request.user and not request.user.has_perm('citytree.can_delete_not_own_tree_record'):# and not request.user.is_staff and not request.user.is_superuser:
                    raise PermissionDenied('You do not have enough permissions to delete the entry that was created by another user.')
                #obj_tree.delete()
                obj_tree.is_deleted = True
                obj_tree.is_geojsoned = False
                obj_tree.save()
                return redirect(obj_city)


            elif request.POST.get('send') == 'saveInsp':
                inspId = request.POST.get('inspId')  # получаем id если редактируем
                if inspId:  # если есть id значит редактируем

                    if not request.user.has_perm('citytree.change_inspection'):
                        raise PermissionDenied('You do not have sufficient permissions to change this data.')

                    obj_insp = get_object_or_404(Inspection, pk=inspId)

                    # проверяем, если редактируется не своя запись, имеет ли право ее редактировать
                    if obj_insp.user != request.user and not request.user.has_perm('citytree.can_change_not_own_insp_record'):# and not request.user.is_staff and not request.user.is_superuser:
                        raise PermissionDenied('You do not have enough permissions to change the entry that was created by another user.')

                    bound_form_insp = IncpectionFormNew(request.POST, request.FILES, instance=obj_insp)

                    if bound_form_insp.is_valid(): #только после валидации в obj_insp попадают данные из формы
                        #print('valid')

                        obj_insp = bound_form_insp.save(commit=False)
                        #obj_insp.user_id = 1


                        # если файл уже существует в S3, тогда в photo1_newname содержится новое имя файла
                        photo1_newname = request.POST.get('photo1_newname')
                        if photo1_newname:
                            obj_insp.photo1.name = photo1_newname

                        photo2_newname = request.POST.get('photo2_newname')
                        if photo2_newname:
                            obj_insp.photo2.name = photo2_newname

                        photo3_newname = request.POST.get('photo3_newname')
                        if photo3_newname:
                            obj_insp.photo3.name = photo3_newname


                        # for deleting photos
                        if request.POST.get('insp_photo1_filename') == '*will_be_deleted*':
                            obj_insp.photo1 = '' #obj_insp.photo1.delete()
                        if request.POST.get('insp_photo2_filename') == '*will_be_deleted*':
                            obj_insp.photo2 = ''
                        if request.POST.get('insp_photo3_filename') == '*will_be_deleted*':
                            obj_insp.photo3 = ''

                        obj_insp = bound_form_insp.save()

                        response = redirect(obj_city)
                        response['Location'] += '?lat=' + str(obj_insp.tree.latitude) + '&lng=' + str(obj_insp.tree.longitude)
                        return response

                else: # create a new inspection
                    if not request.user.has_perm('citytree.add_inspection'):
                        raise PermissionDenied

                    obj_insp = None
                    bound_form_insp = IncpectionFormNew(request.POST, request.FILES)

                    if bound_form_insp.is_valid():
                        #print('valid')
                        obj_insp = bound_form_insp.save(commit=False)
                        obj_insp.tree_id = treeId
                        obj_insp.user = request.user
                        obj_insp = bound_form_insp.save()

                        response = redirect(obj_city)
                        response['Location'] += '?lat=' + str(obj_insp.tree.latitude) + '&lng=' + str(obj_insp.tree.longitude)
                        return response

            elif request.POST.get('send') == 'deleteInsp':
                if not request.user.has_perm('citytree.delete_inspection'):
                    raise PermissionDenied

                inspId = request.POST.get('inspId')
                obj_insp = get_object_or_404(Inspection, pk=inspId)

                # проверяем, если удаляется не своя запись, имеет ли право ее удалить
                if obj_insp.user != request.user and not request.user.has_perm('citytree.can_delete_not_own_insp_record'):# and not request.user.is_staff and not request.user.is_superuser:
                    raise PermissionDenied

                response = redirect(obj_city)
                response['Location'] += '?lat=' + str(obj_insp.tree.latitude) + '&lng=' + str(obj_insp.tree.longitude)
                obj_insp.delete()
                return response



            elif request.POST.get('send') == 'saveAct':
                actId = request.POST.get('actionId')  # получаем id если редактируем
                if actId:  # если есть id значит редактируем
                    if not request.user.has_perm('citytree.change_careactivity'):
                        raise PermissionDenied

                    obj_act = get_object_or_404(CareActivity, pk=actId)

                    # проверяем, если редактируется не своя запись, имеет ли право ее редактировать
                    if obj_act.user != request.user and not request.user.has_perm('citytree.can_change_not_own_action_record'):# and not request.user.is_staff and not request.user.is_superuser:
                        raise PermissionDenied

                    bound_form_act = ActionFormNew(request.POST, instance=obj_act)

                    if bound_form_act.is_valid(): #только после валидации в obj_act попадают данные из формы
                        obj_act = bound_form_act.save()

                        response = redirect(obj_city)
                        response['Location'] += '?lat=' + str(obj_act.tree.latitude) + '&lng=' + str(obj_act.tree.longitude)
                        return response

                else: # create a new inspection
                    if not request.user.has_perm('citytree.add_careactivity'):
                        raise PermissionDenied
                    obj_act = None
                    bound_form_act = ActionFormNew(request.POST)

                    if bound_form_act.is_valid():
                        #print('valid')
                        obj_act = bound_form_act.save(commit=False)
                        obj_act.tree_id = treeId
                        obj_act.user = request.user
                        obj_act = bound_form_act.save()

                        response = redirect(obj_city)
                        response['Location'] += '?lat=' + str(obj_act.tree.latitude) + '&lng=' + str(obj_act.tree.longitude)
                        return response

            elif request.POST.get('send') == 'deleteAct':
                if not request.user.has_perm('citytree.delete_careactivity'):
                    raise PermissionDenied

                actId = request.POST.get('actionId')
                obj_act = get_object_or_404(CareActivity, pk=actId)

                # проверяем, если удаляется не своя запись, имеет ли право ее удалить
                if obj_act.user != request.user and not request.user.has_perm('citytree.can_delete_not_own_action_record'):# and not request.user.is_staff and not request.user.is_superuser:
                    raise PermissionDenied

                response = redirect(obj_city)
                response['Location'] += '?lat=' + str(obj_act.tree.latitude) + '&lng=' + str(obj_act.tree.longitude)
                obj_act.delete()
                return response




class getGeojson(View):
    def get(self, request, city_name):
        #print(request.headers['Accept-encoding'])
        obj_city = get_object_or_404(City, sysname=city_name)

        json_file = ''
        file_mode = ''

        if 'Accept-encoding' in request.headers and 'gzip' in request.headers['Accept-encoding']:
            json_file = obj_city.sysname + '.json.gz'
            file_mode = 'rb'
        else:
            json_file = obj_city.sysname + '.json'
            file_mode = 'r'

        json_file = os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', json_file)


        if not os.path.exists(json_file):
            citydataToGeoJson(obj_city)

        with open(json_file , file_mode) as myfile:
            data=myfile.read()

        response = HttpResponse(content=data)
        if file_mode == 'rb':
            response['Content-Encoding'] = 'gzip'
            response['Content-Length'] = len(response.content)
        response['Content-Type'] = 'application/json'

        return response




class ExportGeoJson(View):
    def get(self, request, city_name):
        if not request.user.is_staff:
            raise PermissionDenied('You do not have enough permissions.')
        obj_city = get_object_or_404(City, sysname=city_name)
        citydataToGeoJson(obj_city)
        return redirect(obj_city)



class DeleteAllTrees(View):
    def get(self, request, city_name):
        obj_city = get_object_or_404(City, sysname=city_name)
        #trees = Tree.objects.filter(city=obj_city)[:1000].delete()
        #Tree.objects.filter(pk__in=Tree.objects.filter(city=obj_city).values_list('pk')[:500]).delete()
        return redirect(obj_city)





def create_trees(request):
    for x in range(1000):
        lat = round(random.uniform(43.17213, 43.23245), 5)
        lng = round(random.uniform(27.86957, 27.94647), 5)
        tree_obj = Tree(city_id=1, latitude=lat, longitude=lng, useradded_id=1, species_id=1, placetype_id=random.randint(1, 5))
        tree_obj.save()

        insp_obj = Inspection(tree_id=tree_obj.id, user_id=1, crowndiameter=random.randint(10, 30), trunkgirth=random.randint(30, 350), height=10, status_id=1)
        insp_obj.save()
        print(x)




class ajaxGetTree(View):
    def get(self, request):

        if request.is_ajax:
            idTree = request.GET.get('idtree', None)
            obj_tree = get_object_or_404(Tree, pk=idTree)
            json_send = serialize('json', [obj_tree,])

            # делаем так, чтобы избавиться от массива, т.к. объект все равно один
            struct = json.loads(json_send)
            idFK_species = struct[0]["fields"]["species"]
            idFK_status = struct[0]["fields"]["lastinsp_status"]

            # т.к. серилизация возвращает лишь внешние ключи, то заполняет значения вручную
            obj_species = Species.objects.get(pk=idFK_species)
            obj_status = Status.objects.get(pk=idFK_status)
            sRemarks = ', '.join(obj_tree.lastinsp_remarks.values_list('remarkname', flat=True))
            sRecommendations = ', '.join(obj_tree.lastinsp_recommendations.values_list('carename', flat=True))

            struct[0]["fields"]["species"] = obj_species.speciesname
            struct[0]["fields"]["localname"] = obj_species.localname
            struct[0]["fields"]["lastinsp_status"] = obj_status.statusname
            struct[0]["fields"]["lastinsp_remarks"] = sRemarks
            struct[0]["fields"]["lastinsp_recommendations"] = sRecommendations

            json_send = json.dumps(struct[0])
            return JsonResponse(json_send, safe=False, status=200)



class ajaxGetInspAct(View):
    def get(self, request):

        if request.is_ajax:

            idTree = request.GET.get('idtree', None)

            obj_inspections = None
            obj_actions = None


            obj_tree = get_object_or_404(Tree, pk=idTree)

            #if request.user.has_perm('citytree.view_inspection'):
            obj_inspections = obj_tree.inspection_set.all().order_by('-datetime')

            #if request.user.has_perm('citytree.view_careactivity'):
            obj_actions = obj_tree.careactivity_set.all().order_by('-date')


            #ser_instance = serializers.serialize('json', obj_inspections, fields=('tree','datetime','crowndiameter',))
            # send to client side.
            #return JsonResponse({"inspections": ser_instance}, status=200)

            fields = ('datetime')
            fields2 = ('date')
            json_send = serialize_bootstraptable2(obj_inspections, obj_actions, fields, fields2)
            return JsonResponse(json_send, safe=False, status=200)



            #for x in range(30):
            #    lat = round(random.uniform(43.17213, 43.23245), 5)
            #    lng = round(random.uniform(27.86957, 27.94647), 5)
            #    tree_obj = Tree(city_id=1, latitude=lat, longitude=lng, useradded_id=1, species_id=1, placetype_id=1)
            #    tree_obj.save()

            #    insp_obj = Inspection(tree_id=tree_obj.id, user_id=1, crowndiameter=10, trunkgirth=random.randint(30, 350), height=10, status_id=1)
            #    insp_obj.save()



class ajaxSetMapName(View):
    def get(self, request):

        if request.is_ajax:
            mapname = request.GET.get('mapname', 'Default')
            request.session['mapname'] = mapname
            return HttpResponse(status=200)





def citydataToGeoJson(obj_city):

    tree_data = Tree.objects.filter(city_id=obj_city.id).filter(is_deleted=False).values_list('id', 'latitude', 'longitude', 'datetimeadded',
                                                                     'useradded_id', 'dateplanted', 'species_id',
                                                                     'speciescomment', 'comment', 'googlestreeturl',
                                                                     'placetype_id', 'irrigationmethod_id',
                                                                     'lastinsp_datetime', 'lastinsp_comment',
                                                                     'lastinsp_crowndiameter', 'lastinsp_trunkgirth',
                                                                     'lastinsp_height',
                                                                     'lastinsp_status_id', 'lastinsp_photo1',
                                                                     'lastinsp_photo2', 'lastinsp_photo3',
                                                                     'lastinsp_remarks_list',
                                                                     'lastinsp_recommendations_list',
                                                                     'lastinsp_remarks_text',
                                                                     'lastinsp_recommendations_text', 'lastinsp_remarks', named=True)




    treeJsonData = {
        "type": "FeatureCollection",
        "features": []  # сюда будем добавлять данные
    }

    if tree_data:
        for treeItem in tree_data:
            if treeItem.speciescomment:
                speciescomment = treeItem.speciescomment
            else:
                speciescomment = ""

            if treeItem.comment:
                comment = treeItem.comment
            else:
                comment = ""

            if treeItem.dateplanted:
                dateplanted = treeItem.dateplanted.strftime("%Y-%m-%d")
            else:
                dateplanted = ""

            if treeItem.datetimeadded:
                datetimeadded = treeItem.datetimeadded.strftime("%Y-%m-%d")
            else:
                datetimeadded = ""

            if treeItem.lastinsp_datetime:
                datetimeinsp = treeItem.lastinsp_datetime.strftime("%Y-%m-%d")
            else:
                datetimeinsp = ""

            if treeItem.lastinsp_crowndiameter:
                crowndiameter = int(treeItem.lastinsp_crowndiameter)
            else:
                crowndiameter = 0

            if treeItem.lastinsp_trunkgirth:
                trunkgirth = int(treeItem.lastinsp_trunkgirth)
            else:
                trunkgirth = 0

            if treeItem.lastinsp_height:
                height = int(treeItem.lastinsp_height)
            else:
                height = 0

            if treeItem.lastinsp_recommendations_list:
                recommendations_list = str(treeItem.lastinsp_recommendations_list).replace('"', '').split(',')
            else:
                recommendations_list = []

            if treeItem.lastinsp_remarks_list:
                remarks_list = str(treeItem.lastinsp_remarks_list).replace('"', '').split(',')
            else:
                remarks_list = []

            treeJson = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [str(treeItem.longitude), str(treeItem.latitude)]
                },

                "properties": {
                    "ajax": 1,
                    "coordinates": [str(treeItem.longitude), str(treeItem.latitude)],
                    "id": treeItem.id,
                    "user_id": treeItem.useradded_id,
                    "species": treeItem.species_id,
                    "speciescomment": speciescomment,
                    "comment": comment,
                    "placetype": '{}'.format(treeItem.placetype_id),
                    "irrigationmethod": '{}'.format(treeItem.irrigationmethod_id),
                    "dateplanted": dateplanted,
                    "datetimeadded": datetimeadded,
                    "googlestreeturl": '{}'.format(treeItem.googlestreeturl),
                    "crowndiameter": crowndiameter,
                    "trunkgirth": trunkgirth,
                    "height": height,
                    "status": '{}'.format(treeItem.lastinsp_status_id),
                    "datetimeinsp": datetimeinsp,
                    "recommendations": recommendations_list,
                    "remarks": remarks_list,
                    "remarks2": treeItem.lastinsp_remarks,
                    "photo1": '{}'.format(treeItem.lastinsp_photo1),
                    "photo2": '{}'.format(treeItem.lastinsp_photo2),
                    "photo3": '{}'.format(treeItem.lastinsp_photo3),

                }
            }

            # print(treeJson)
            # print(str(treeItem.lastinsp_recommendations_list).split(', '))
            treeJsonData["features"].append(treeJson)


    with open(os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', obj_city.sysname + '.json'), 'w', encoding='utf8') as f:
        f.write(json.dumps(treeJsonData, ensure_ascii=False))

    with open(os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', obj_city.sysname + '.json'), 'rb') as f_in:
        with gzip.open(os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', obj_city.sysname + '.json.gz'), 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)


    tree_data.update(is_geojsoned = True)
    #чтобы удаленные записи также поменить как is_geojsoned=True, чтобы они больше не приходили из базы в view Map get
    tree_data = Tree.objects.filter(city_id=obj_city.id).filter(is_deleted=True)
    tree_data.update(is_geojsoned=True)






def citydataToGeoJson2(obj_city):
    tree_data = Tree.objects.filter(city_id=obj_city.id)

    treeJsonData = {
        "type": "FeatureCollection",
        "features": []  # сюда будем добавлять данные
    }

    if tree_data:
        for treeItem in tree_data:
            if treeItem.speciescomment:
                speciescomment = treeItem.speciescomment
            else:
                speciescomment = ""

            if treeItem.comment:
                comment = treeItem.comment
            else:
                comment = ""

            if treeItem.dateplanted:
                dateplanted = treeItem.dateplanted.strftime("%Y-%m-%d")
            else:
                dateplanted = ""

            if treeItem.datetimeadded:
                datetimeadded = treeItem.datetimeadded.strftime("%Y-%m-%d")
            else:
                datetimeadded = ""

            if treeItem.lastinsp_datetime:
                datetimeinsp = treeItem.lastinsp_datetime.strftime("%Y-%m-%d")
            else:
                datetimeinsp = ""

            if treeItem.lastinsp_crowndiameter:
                crowndiameter = int(treeItem.lastinsp_crowndiameter)
            else:
                crowndiameter = 0

            if treeItem.lastinsp_trunkgirth:
                trunkgirth = int(treeItem.lastinsp_trunkgirth)
            else:
                trunkgirth = 0

            if treeItem.lastinsp_height:
                height = int(treeItem.lastinsp_height)
            else:
                height = 0

            if treeItem.lastinsp_recommendations_list:
                recommendations_list = str(treeItem.lastinsp_recommendations_list).replace('"', '').split(',')
            else:
                recommendations_list = []

            if treeItem.lastinsp_remarks_list:
                remarks_list = str(treeItem.lastinsp_remarks_list).replace('"', '').split(',')
            else:
                remarks_list = []

            treeJson = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [str(treeItem.longitude), str(treeItem.latitude)]
                },

                "properties": {
                    "ajax": 1,
                    "coordinates": [str(treeItem.longitude), str(treeItem.latitude)],
                    "id": treeItem.id,
                    "species": treeItem.species_id,
                    "speciescomment": speciescomment,
                    "comment": comment,
                    "placetype": '{}'.format(treeItem.placetype_id),
                    "irrigationmethod": '{}'.format(treeItem.irrigationmethod_id),
                    "dateplanted": dateplanted,
                    "datetimeadded": datetimeadded,
                    "googlestreeturl": '{}'.format(treeItem.googlestreeturl),
                    "crowndiameter": crowndiameter,
                    "trunkgirth": trunkgirth,
                    "height": height,
                    "status": '{}'.format(treeItem.lastinsp_status_id),
                    "datetimeinsp": datetimeinsp,
                    "recommendations": recommendations_list,
                    "remarks": remarks_list,
                    "photo1": '{}'.format(treeItem.lastinsp_photo1),
                    "photo2": '{}'.format(treeItem.lastinsp_photo2),
                    "photo3": '{}'.format(treeItem.lastinsp_photo3),

                }
            }

            # print(treeJson)
            # print(str(treeItem.lastinsp_recommendations_list).split(', '))
            treeJsonData["features"].append(treeJson)

    # with open('./mapedit/dataptp/'+city_name+'.json', 'w', encoding='utf8') as f:
    with open(os.path.join(djangoSettings.MEDIA_ROOT, 'citytree/geojson/') + obj_city.sysname + '.json', 'w',
              encoding='utf8') as f:

        f.write(json.dumps(treeJsonData, ensure_ascii=False))
        # myfile = File(f)
        # myfile.write( json.dumps(ptpJsonData, ensure_ascii=False) )

    # myfile.closed
    # f.closed
    # return HttpResponse("Updated")
    tree_data.update(is_geojsoned=True)
    # return redirect(obj_city)






import boto3
from botocore.client import Config
from pathlib import Path
from botocore.errorfactory import ClientError

def get_s3_connection():
    key = getattr(djangoSettings, 'AWS_ACCESS_KEY_ID', None)
    secret = getattr(djangoSettings, 'AWS_SECRET_ACCESS_KEY', None)
    if not key or not secret:
        return None

    print(secret)
    return boto3.client(
        's3',
        djangoSettings.AWS_S3_REGION_NAME,
        aws_access_key_id=key,
        aws_secret_access_key=secret,
        config=Config(signature_version=djangoSettings.AWS_S3_SIGNATURE_VERSION)
        )


class GetS3SignedUrl(View):
    """
    Generate Signed url for s3
    """

    def get(self, request, *args, **kwargs):
        s3 = get_s3_connection()

        file_name = request.GET.get('file_name')
        #username = request.GET.get('username')

        final_file_name = djangoSettings.AWS_LOCATION + '/' + user_directory_path(request, file_name)

        print(final_file_name)

        #check if file exists in bucket
        is_file_exists = False
        response = s3.list_objects_v2(Bucket=djangoSettings.AWS_STORAGE_BUCKET_NAME, Prefix=final_file_name)
        for obj in response.get('Contents', []):
            if obj['Key'] == final_file_name:
                is_file_exists = True
                break


        url = s3.generate_presigned_post(
            Bucket=djangoSettings.AWS_STORAGE_BUCKET_NAME,
            Key=final_file_name,
            Fields={"acl": "public-read", "Content-Type": "image/jpeg"},
            Conditions=[
                {"acl": "public-read"},
                {"Content-Type": "image/jpeg"}
            ],
            ExpiresIn=3600
        )

        print(final_file_name)
        print(url)


        return HttpResponse(json.dumps({
            'data': url,
            'url': 'https://%s.s3.amazonaws.com/%s' % (djangoSettings.AWS_STORAGE_BUCKET_NAME, final_file_name),
            'file_exists': is_file_exists
            }))
