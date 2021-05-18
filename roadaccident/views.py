from django.shortcuts import render, redirect
from django.views.generic import View
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.core.exceptions import PermissionDenied
from .forms import *
from .models import *


from datetime import *
import random

import json
import os
from django.contrib.staticfiles import finders
from django.conf import settings as djangoSettings
import gzip
import shutil
from django.core.files import File



# Create your views here.
class Map(View):
    def get(self, request, city_name):
        obj_city = get_object_or_404(City, sysname__iexact=city_name)
        #citydataToGeoJson(obj_city)
        maneuvers = Maneuver.objects.all()

        TypeViolation_dict = TypeViolation.objects.all()
        Violator_dict = Violator.objects.all()

        obj_all_cities = City.objects.all().order_by('-population')
        accident_data = Accident.objects.filter(city_id=obj_city.id)
        accident_data = None

        form = AccidentForm()

        context = {'form': form,
                   'obj_city': obj_city,
                   'accident_data': accident_data,
                   'obj_all_cities': obj_all_cities,
                   'maneuvers': maneuvers,

                   'TypeViolation_dict': TypeViolation_dict,
                   'Violator_dict': Violator_dict,

                   'lat': request.GET.get('lat'),
                   'lng': request.GET.get('lng'),
                   'hide_cluster_zoomout': True}

        return render(request, 'roadaccident/index.html', context)


    def post(self, request, city_name):
        if not request.user.is_authenticated:
            return redirect('%s?next=%s' % (reverse('login'), request.path))
        else:
            obj_city = get_object_or_404(City, sysname__iexact=city_name)
            accidentId = request.POST.get('accidentId')  # получаем id accident если редактируем

            if request.POST.get('send') == 'save':
                if accidentId:  # если в accidentId есть id значит редактируем

                    if not request.user.has_perm('roadaccident.change_accident'):
                        raise PermissionDenied('You do not have sufficient permissions to change this data.')

                    obj_accident = get_object_or_404(Accident, pk=accidentId)
                else:
                    if not request.user.has_perm('roadaccident.add_accident'):
                        raise PermissionDenied('You do not have enough permissions to create an entry.')

                    obj_accident = None

                bound_form = AccidentForm(request.POST, instance=obj_accident)


                if bound_form.is_valid():
                    obj_newaccident = bound_form.save(commit=False)
                    obj_newaccident.city_id = obj_city.id
                    if not accidentId: # if is new record, assign user id
                        obj_newaccident.useradded = request.user
                    obj_newaccident = bound_form.save()

                    response = redirect(obj_city)
                    response['Location'] += '?lat=' + str(obj_newaccident.latitude) + '&lng=' + str(obj_newaccident.longitude)
                    print(response['Location'])
                    return response
                    #return redirect(obj_city)
                else:
                    print(bound_form.errors)
                    return render(request, 'roadaccident/index.html', context={'form': bound_form})
                    #return HttpResponse(bound_form.errors)

            elif request.POST.get('send') == 'delete':
                if not request.user.has_perm('roadaccident.delete_accident'):
                    raise PermissionDenied('You do not have enough permissions to delete the entry.')

                obj_accident = get_object_or_404(Accident, pk=accidentId)
                #obj_accident.delete()
                obj_accident.is_deleted = True
                obj_accident.save()
                return redirect(obj_city)


        """    
        if request.user.is_authenticated:
            CityObj = get_object_or_404(city, sysname = city_name)
            isAllow = UserCity.objects.filter(city_id=CityObj.id, user_id=request.user.id).count() # проверяем есть ли у пользователя разрешение для данного города

            if isAllow > 0 or request.user.is_staff:
                record_id = request.POST.get('record_id') # получаем объект ptp если редактируем

                if not request.POST._mutable:
                    request.POST._mutable = True # позволяет изменять значения в запросе

                request.POST['datetime'] = datetime.datetime.strptime(request.POST['datetime'], '%d/%m/%Y %H:%M').strftime(' %Y-%m-%d %H:%M:%S') #меняем формат даты для БД

                if record_id: #если в record_id есть id значит редактируем
                    ptp_object = get_object_or_404(ptp, pk=record_id)
                else:
                    ptp_object = None

                form = PTPForm(request.POST, instance=ptp_object) # заполняем форму данными из POST, такжа добавляется объект записи, если редактируем

                if form.is_valid():
                    new_ptp = form.save(commit=False)
                    new_ptp.city_id = CityObj.id # присваиваем id города, т.к. на форме нет компонента для выбора города
                    new_ptp = form.save()
                    response = redirect('editor', city_name = CityObj.sysname)
                    response['Location'] += '?lat='+ str(new_ptp.latitude) + '&lng=' + str(new_ptp.longitude)
                    return response
            else:
                return HttpResponse("Access denied")
        else:
            return HttpResponseRedirect(reverse('login'))
        """







def citydataToGeoJson(obj_city):

    accident_data = Accident.objects.filter(city_id=obj_city.id).filter(is_deleted=False)
                                                                #.values_list('id', 'latitude', 'longitude', 'datetime',
                                                                #     'maneuver_id', 'description', 'violations_type', 'violators',
                                                                #     'drivers_injured', 'motorcyclists_injured', 'cyclists_injured', 'ped_injured', 'kids_injured', 'pubtr_passengers_injured',
                                                                #     'drivers_killed', 'motorcyclists_killed', 'cyclists_killed', 'ped_killed', 'kids_killed', 'pubtr_passengers_killed',
                                                                #     'public_transport_involved'
                                                                #     , named=True)


    accidentJsonData = {
        "type": "FeatureCollection",
        "features": []  # сюда будем добавлять данные
    }

    if accident_data:
        for accidentItem in accident_data:

            if accidentItem.datetime:
                datetime = accidentItem.datetime.strftime("%Y-%m-%dT%H:%M")
            else:
                datetime = ""

            if accidentItem.description:
                description = accidentItem.description
            else:
                description = ""

            if accidentItem.violations_type:
                violations_type = str(accidentItem.violations_type).replace('"', '').split(',')
            else:
                violations_type = []

            if accidentItem.violators:
                violators = str(accidentItem.violators).replace('"', '').split(',')
            else:
                violators = []


            accidentJson = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [str(accidentItem.longitude), str(accidentItem.latitude)]
                },

                "properties": {
                    "coordinates": [str(accidentItem.longitude), str(accidentItem.latitude)],
                    "id": accidentItem.id,
                    "user_id": accidentItem.useradded_id,
                    "datetime": datetime,
                    "maneuver": accidentItem.maneuver_id,
                    "description": description,
                    "violations_type": violations_type,
                    "violators": violators,
                    "drivers_injured": accidentItem.drivers_injured,
                    "motorcyclists_injured": accidentItem.motorcyclists_injured,
                    "cyclists_injured": accidentItem.cyclists_injured,
                    "ped_injured": accidentItem.ped_injured,
                    "kids_injured": accidentItem.kids_injured,
                    "pubtr_passengers_injured": accidentItem.pubtr_passengers_injured,
                    "drivers_killed": accidentItem.drivers_killed,
                    "motorcyclists_killed": accidentItem.motorcyclists_killed,
                    "cyclists_killed": accidentItem.cyclists_killed,
                    "ped_killed": accidentItem.ped_killed,
                    "kids_killed": accidentItem.kids_killed,
                    "pubtr_passengers_killed": accidentItem.pubtr_passengers_killed,
                    "public_transport_involved": accidentItem.public_transport_involved

                }
            }


            # print(treeJson)
            # print(str(treeItem.lastinsp_recommendations_list).split(', '))
            accidentJsonData["features"].append(accidentJson)


    with open(os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', 'roadaccident', obj_city.sysname + '.json'), 'w', encoding='utf8') as f:
        f.write(json.dumps(accidentJsonData, ensure_ascii=False))

    with open(os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', 'roadaccident', obj_city.sysname + '.json'), 'rb') as f_in:
        with gzip.open(os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', 'roadaccident', obj_city.sysname + '.json.gz'), 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)


    #tree_data.update(is_geojsoned = True)
    #чтобы удаленные записи также поменить как is_geojsoned=True, чтобы они больше не приходили из базы в view Map get
    #tree_data = Tree.objects.filter(city_id=obj_city.id).filter(is_deleted=True)
    #tree_data.update(is_geojsoned=True)




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

        json_file = os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', 'roadaccident', json_file)


        #if not os.path.exists(json_file):
        #    citydataToGeoJson(obj_city)

        citydataToGeoJson(obj_city)

        with open(json_file , file_mode) as myfile:
            data=myfile.read()

        response = HttpResponse(content=data)
        if file_mode == 'rb':
            response['Content-Encoding'] = 'gzip'
            response['Content-Length'] = len(response.content)
        response['Content-Type'] = 'application/json'

        return response










class Test(View):
    def get(self, request):
        return render(request, 'roadaccident/index.html')


class PtpImport(View):

    def get(self, request):
        #Accident.objects.all().delete();
        with open(finders.find('all.geojson'), encoding='utf-8') as read_file:
            data = json.load(read_file)
            features = data["features"]

        for feature in features:
            datetime = feature["properties"]["DateTime"]
            description = feature["properties"]["description"]
            lng = feature["geometry"]["coordinates"][0]
            lat = feature["geometry"]["coordinates"][1]


            datetime = datetime.replace('T', ' ')
            datetime = datetime.replace('.000Z', '')

            ptprecord = Accident(city_id=1, latitude=lat, longitude=lng, description=description, datetime=datetime)
            ptprecord.save()

        #return HttpResponseRedirect(reverse('editor'))




class create_accidents(View):
    def get(self, request):
        dt = datetime.now() - timedelta(days=2000)
        for x in range(2000):
            lat = round(random.uniform(43.17213, 43.23245), 5)
            lng = round(random.uniform(27.86957, 27.94647), 5)
            dt = dt + timedelta(days=1)

            obj = Accident(city_id=1, latitude=lat, longitude=lng, datetime=dt)
            obj.save()

            print(x)

class DeleteAll(View):
    def get(self, request, city_name):
        obj_city = get_object_or_404(City, sysname=city_name)
        Accident.objects.filter(city=obj_city).delete()
        return redirect(obj_city)