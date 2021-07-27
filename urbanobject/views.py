from django.shortcuts import render, redirect
from django.views.generic import View
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from django.conf import settings as djangoSettings
import os
import json
import gzip
import shutil

from .forms import *
from .models import *


class Map(View):
    def get(self, request, city_name):
        obj_city = get_object_or_404(City, sysname__iexact=city_name)
        #urbanObject_data = urbanObject.objects.filter(city_id=obj_city.id)
        categories = catObject.objects.all().order_by('catname')
        radiusMode = RadiusTransportMode.objects.all().order_by('radius')
        obj_all_cities = City.objects.all().order_by('-population')

        formUrbanObject = urbanObjectForm()


        context = {'obj_city': obj_city,
                   #'urbanObject_data': urbanObject_data,
                   'categories': categories,
                   'radiusMode': radiusMode,
                   'obj_all_cities': obj_all_cities,
                   'formUrbanObject': formUrbanObject,

                   'lat': request.GET.get('lat'),
                   'lng': request.GET.get('lng')
                   }

        return render(request, 'urbanobject/index.html', context)



    def post(self, request, city_name):
        if not request.user.is_authenticated:
            return redirect('%s?next=%s' % (reverse('login'), request.path))
        else:
            obj_city = get_object_or_404(City, sysname__iexact=city_name)
            urbanObjectId = request.POST.get('urbanObjectId')  # получаем id если редактируем
            request.session['dbdata_changed'] = True

            # edit UrbanObject
            if request.POST.get('send') == 'save':
                if urbanObjectId:  # если в accidentId есть id значит редактируем

                    if not request.user.has_perm('coregis.change_coreurbanobject'):
                        raise PermissionDenied ('You do not have sufficient permissions to change this data.')

                    obj_urbanobject = get_object_or_404(urbanObject, pk=urbanObjectId)
                    #проверяем, если редактируется не своя запись, имеет ли право ее редактировать
                    if obj_urbanobject.useradded != request.user and not request.user.has_perm('coregis.can_change_not_own_object_record'):# and not request.user.is_staff and not request.user.is_superuser:
                        raise PermissionDenied ('You cannot change information about the object if this object was added by another user.')

                    bound_form_urbanobject = urbanObjectForm(request.POST, instance=obj_urbanobject)

                    if bound_form_urbanobject.is_valid(): #and bound_form_inspec.is_valid():
                        #print('valid')
                        obj_urbanobject = bound_form_urbanobject.save(commit=False)
                        obj_urbanobject.city_id = obj_city.id

                        if not request.POST.get('rating'): #поле obj_urbanobject.rating не может быть null, поэтому заменяет на 0
                            obj_urbanobject.rating = 0

                        # имя файла береться из photoN_newname, т.к. в POST запросе файлы на сервер не передаются
                        photo1_newname = request.POST.get('photo1_newname')
                        if photo1_newname:
                            if photo1_newname == '*will_be_deleted*':
                                obj_urbanobject.photo1 = ''
                            else:
                                obj_urbanobject.photo1.name = user_directory_path(request, photo1_newname)

                        photo2_newname = request.POST.get('photo2_newname')
                        if photo2_newname:
                            if photo2_newname == '*will_be_deleted*':
                                obj_urbanobject.photo2 = ''
                            else:
                                obj_urbanobject.photo2.name = user_directory_path(request, photo2_newname)

                        photo3_newname = request.POST.get('photo3_newname')
                        if photo3_newname:
                            if photo3_newname == '*will_be_deleted*':
                                obj_urbanobject.photo3 = ''
                            else:
                                obj_urbanobject.photo3.name = user_directory_path(request, photo3_newname)


                        # for deleting photos
                        #if request.POST.get('photo1_filename') == '*will_be_deleted*':
                        #    obj_urbanobject.photo1 = '' #obj_insp.photo1.delete()
                        #if request.POST.get('photo2_filename') == '*will_be_deleted*':
                        #    obj_urbanobject.photo2 = ''
                        #if request.POST.get('photo3_filename') == '*will_be_deleted*':
                        #    obj_urbanobject.photo3 = ''


                        obj_urbanobject = bound_form_urbanobject.save()

                        response = redirect(obj_city)
                        response['Location'] += '?lat=' + str(obj_urbanobject.latitude) + '&lng=' + str(obj_urbanobject.longitude)
                        return response


                else: # create a new tree
                    if not request.user.has_perm('coregis.add_coreurbanobject'):
                        raise PermissionDenied ('You do not have enough permissions to create an entry.')


                    #print(dir(request.FILES))

                    bound_form_urbanobject = urbanObjectForm(request.POST, request.FILES)


                    if bound_form_urbanobject.is_valid():

                        obj_urbanobject = bound_form_urbanobject.save(commit=False)
                        obj_urbanobject.city_id = obj_city.id
                        obj_urbanobject.useradded = request.user

                        if not request.POST.get('rating'): #поле obj_urbanobject.rating не может быть null, поэтому заменяет на 0
                            obj_urbanobject.rating = 0

                        # имя файла береться из photoN_newname, т.к. в POST запросе файлы на сервер не передаются
                        photo1_newname = request.POST.get('photo1_newname')
                        if photo1_newname:
                            obj_urbanobject.photo1.name = user_directory_path(request, photo1_newname)

                        photo2_newname = request.POST.get('photo2_newname')
                        if photo2_newname:
                            obj_urbanobject.photo2.name = user_directory_path(request, photo2_newname)

                        photo3_newname = request.POST.get('photo3_newname')
                        if photo3_newname:
                            obj_urbanobject.photo3.name = user_directory_path(request, photo3_newname)

                        #print(request.META['CONTENT_LENGTH'])

                        obj_urbanobject = bound_form_urbanobject.save()


                        response = redirect(obj_city)
                        response['Location'] += '?lat=' + str(obj_urbanobject.latitude) + '&lng=' + str(obj_urbanobject.longitude)
                        return response

                    else:
                        return render(request, 'urbanobject/index.html', context={'obj_city': obj_city, 'formUrbanObject': bound_form_urbanobject})
                        #return HttpResponse(bound_form.errors)

            elif request.POST.get('send') == 'delete':
                if not request.user.has_perm('coregis.delete_coreurbanobject'):
                    raise PermissionDenied('You do not have enough permissions to delete the entry.')

                obj_urbanobject = get_object_or_404(urbanObject, pk=urbanObjectId)
                # проверяем, если удаляется не своя запись, имеет ли право ее удалить
                if obj_urbanobject.useradded != request.user and not request.user.has_perm('coregis.can_delete_not_own_object_record'):# and not request.user.is_staff and not request.user.is_superuser:
                    raise PermissionDenied('You do not have enough permissions to delete the entry that was created by another user.')
                #obj_urbanobject.delete()
                obj_urbanobject.is_deleted = True
                obj_urbanobject.save()
                return redirect(obj_city)




class ajaxSetMapName(View):
    def get(self, request):

        if request.is_ajax:
            mapname = request.GET.get('mapname', 'Default')
            request.session['mapname'] = mapname
            return HttpResponse(status=200)




def citydataToGeoJson(obj_city):

    urbanobject_data = urbanObject.objects.filter(city_id=obj_city.id).filter(is_deleted=False)


    urbanobjectJsonData = {
        "type": "FeatureCollection",
        "features": []  # сюда будем добавлять данные
    }

    if urbanobject_data:
        for urbanobjectItem in urbanobject_data:


            subcategories = []
            if urbanobjectItem.subcategories:
                subcategories_Q = urbanobjectItem.subcategories.values_list('id', flat=True)
                for item in subcategories_Q:
                    subcategories.append(str(item))


            catsubcategories = []
            if urbanobjectItem.subcategories:
                subcategories_Q = urbanobjectItem.subcategories.values_list('id', flat=True)
                for item in subcategories_Q:
                    catsubcategories.append('_'+str(item))

            if urbanobjectItem.category_id:
                catsubcategories.append(str(urbanobjectItem.category_id))


            if urbanobjectItem.description:
                description = urbanobjectItem.description
            else:
                description = ""

            if urbanobjectItem.comment:
                comment = urbanobjectItem.comment
            else:
                comment = ""

            if urbanobjectItem.googlestreeturl:
                googlestreeturl = urbanobjectItem.googlestreeturl
            else:
                googlestreeturl = ""


            urbanobjectJson = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [str(urbanobjectItem.longitude), str(urbanobjectItem.latitude)]
                },

                "properties": {
                    "coordinates": [str(urbanobjectItem.longitude), str(urbanobjectItem.latitude)],
                    "id": urbanobjectItem.id,
                    "user_id": urbanobjectItem.useradded_id,
                    "category": urbanobjectItem.category_id,
                    "icon": urbanobjectItem.category.icon,
                    "subcategories": subcategories,
                    "catsubcategories": catsubcategories,
                    "description": description,
                    "comment": comment,
                    "googlestreeturl": googlestreeturl,
                    "rating": urbanobjectItem.rating,
                    "photo1": '{}'.format(urbanobjectItem.photo1),
                    "photo2": '{}'.format(urbanobjectItem.photo2),
                    "photo3": '{}'.format(urbanobjectItem.photo3),
                }
            }


            # print(treeJson)
            # print(str(treeItem.lastinsp_recommendations_list).split(', '))
            urbanobjectJsonData["features"].append(urbanobjectJson)


    with open(os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', 'urbanobject', obj_city.sysname + '.json'), 'w', encoding='utf8') as f:
        f.write(json.dumps(urbanobjectJsonData, ensure_ascii=False))

    with open(os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', 'urbanobject', obj_city.sysname + '.json'), 'rb') as f_in:
        with gzip.open(os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', 'urbanobject', obj_city.sysname + '.json.gz'), 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)





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

        json_file = os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', 'urbanobject', json_file)
        if not os.path.isfile(json_file):
            request.session['dbdata_changed'] = True


        if request.session.get('dbdata_changed', False):
            citydataToGeoJson(obj_city)
            request.session['dbdata_changed'] = False


        with open(json_file , file_mode) as myfile:
            data=myfile.read()

        response = HttpResponse(content=data)
        if file_mode == 'rb':
            response['Content-Encoding'] = 'gzip'
            response['Content-Length'] = len(response.content)
        response['Content-Type'] = 'application/json'

        return response




class getUrbanObject(View):
    def get(self, request):

        if request.is_ajax:
            idUrbanObject = request.GET.get('idUrbanObject', None)
            obj_urbanObject = get_object_or_404(urbanObject, pk=idUrbanObject)
            json_send = serializers.serialize('json', [obj_urbanObject,], ensure_ascii=False)

            # делаем так, чтобы избавиться от массива, т.к. объект все равно один
            struct = json.loads(json_send)
            idFK_category = struct[0]["fields"]["category"]

            # т.к. серилизация возвращает лишь внешние ключи, то заполняет значения вручную
            obj_category = catObject.objects.get(pk=idFK_category)
            sSubcats = ', '.join(obj_urbanObject.subcategories.values_list('subcatname', flat=True))

            struct[0]["fields"]["category"] = obj_category.catname
            struct[0]["fields"]["subcategories_text"] = sSubcats

            json_send = json.dumps(struct[0], ensure_ascii=False)
            return JsonResponse(json_send, safe=False, status=200) #, json_dumps_params={'ensure_ascii': False}





def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'urbanobject/images_object/user_{0}/{1}'.format(instance.user.id, filename)




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
