from django.shortcuts import render, redirect
from django.views.generic import View
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .forms import *
from .models import *


import json
from django.contrib.staticfiles import finders
from django.core.files import File



# Create your views here.
class Map(View):
    def get(self, request, city_name):
        obj_city = get_object_or_404(City, sysname__iexact=city_name)
        maneuvers = Maneuver.objects.all()
        form = AccidentForm()

        obj_all_cities = City.objects.all().order_by('-population')
        accident_data = Accident.objects.filter(city_id=obj_city.id)

        context = {'form': form,
                   'maneuvers': maneuvers,
                   'obj_city': obj_city,
                   'accident_data': accident_data,
                   'obj_all_cities': obj_all_cities,
                   'lat': request.GET.get('lat'),
                   'lng': request.GET.get('lng'),
                   'hide_cluster_zoomout': True}

        return render(request, 'roadaccident/index2.html', context)


    def post(self, request, city_name):
        obj_city = get_object_or_404(City, sysname__iexact=city_name)
        accidentId = request.POST.get('accidentId')  # получаем id accident если редактируем

        if request.POST.get('send') == 'save':
            if accidentId:  # если в accidentId есть id значит редактируем
                obj_accident = get_object_or_404(Accident, pk=accidentId)
            else:
                obj_accident = None

            bound_form = AccidentForm(request.POST, instance=obj_accident)


            if bound_form.is_valid():
                obj_newaccident = bound_form.save(commit=False)
                obj_newaccident.city_id = obj_city.id
                obj_newaccident = bound_form.save()

                response = redirect(obj_city)
                response['Location'] += '?lat=' + str(obj_newaccident.latitude) + '&lng=' + str(obj_newaccident.longitude)
                return response
                #return redirect(obj_city)
            else:
                return render(request, 'roadaccident/index.html', context={'form': bound_form})
                #return HttpResponse(bound_form.errors)

        elif request.POST.get('send') == 'delete':
            obj_accident = get_object_or_404(Accident, pk=accidentId)
            obj_accident.delete()
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

