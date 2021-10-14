from rest_framework import serializers
from roadaccident.models import Accident
from coregis.models import coreUrbanObject


import json
import os
#from django.conf import settings as djangoSettings
#from django.core.files import File



class AccidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accident
        fields = '__all__'
        read_only_fields = ['city', 'useradded', 'is_deleted', 'violations_type_list', 'violators_list'] #set this fields on backend in a view or like signals




def roadaccidentDataToGeoJson(obj_city):

    accident_data = Accident.objects.filter(city_id=obj_city.id).filter(is_deleted=False)
                                                                #.values_list('id', 'latitude', 'longitude', 'datetime',
                                                                #     'maneuver_id', 'description', 'violations_type', 'violators',
                                                                #     'drivers_injured', 'motorcyclists_injured', 'cyclists_injured', 'ped_injured', 'kids_injured', 'pubtr_passengers_injured',
                                                                #     'drivers_killed', 'motorcyclists_killed', 'cyclists_killed', 'ped_killed', 'kids_killed', 'pubtr_passengers_killed',
                                                                #     'public_transport_involved'
                                                                #     , named=True)


    accidentJsonData = {
        "type": "FeatureCollection",
        "city": {
            "name": obj_city.sysname,
            "coordinates": [str(obj_city.longitude), str(obj_city.latitude)]
        },
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

         
            #violations_type = []
            #if accidentItem.violations_type:
            #    violations_type_Q = accidentItem.violations_type.values_list('id', flat=True)
            #    for item in violations_type_Q:
            #        violations_type.append(str(item))

            #violators = []
            #if accidentItem.violators:
            #    violators_Q = accidentItem.violators.values_list('id', flat=True)
            #    for item in violators_Q:
            #        violators.append(str(item))

            if accidentItem.violations_type_list:
                violations_type = str(accidentItem.violations_type_list).replace('"', '').split(',')
            else:
                violations_type = []

            if accidentItem.violators_list:
                violators = str(accidentItem.violators_list).replace('"', '').split(',')
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

            accidentJsonData["features"].append(accidentJson)


    return accidentJsonData









'''

class AccidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accident
        #fields = '__all__'
        fields = ['id', 'latitude', 'longitude', 'datetime', 'maneuver_id', 'description', 
            'drivers_injured', 'motorcyclists_injured', 'cyclists_injured', 'ped_injured', 'kids_injured', 'pubtr_passengers_injured',
            'drivers_killed', 'motorcyclists_killed', 'cyclists_killed', 'ped_killed', 'kids_killed', 'pubtr_passengers_killed',
            'public_transport_involved']

'''

'''
def citydataToGeoJson(obj_city):

    json_file = obj_city.sysname + '.json'
    json_file = os.path.join(djangoSettings.BASE_DIR, 'data', 'geojson', 'roadaccident', json_file)

    with open(json_file , 'r') as myfile:
        data=json.load(myfile)



    accidentJson = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [str(555555), str(55544444)]
        },

        "properties": {
            "coordinates": [str(555555), str(55544444)],
            "id": 1,
            "user_id": 1
        }
    }


  
    data["features"].append(accidentJson)     
    data["features"].append(accidentJson)

    return data
    '''

'''
def citydataToGeoJson2(obj_city):
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

         
            violations_type = []
            if accidentItem.violations_type:
                violations_type_Q = accidentItem.violations_type.values_list('id', flat=True)
                for item in violations_type_Q:
                    violations_type.append(str(item))

            violators = []
            if accidentItem.violators:
                violators_Q = accidentItem.violators.values_list('id', flat=True)
                for item in violators_Q:
                    violators.append(str(item))

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


    return accidentJsonData
    '''





    



def urbanobjectToGeoJson(obj_city):

    urbanobject_data = coreUrbanObject.objects.filter(city=obj_city).filter(is_deleted=False)


    urbanobjectJsonData = {
        "type": "FeatureCollection",
        "features": []  # сюда будем добавлять данные
    }

    if urbanobject_data:
        for urbanobjectItem in urbanobject_data:

            '''
            subcategories = [] # содержит подкатегории объекта
            if urbanobjectItem.subcategories:
                subcategories_Q = urbanobjectItem.subcategories.values_list('id', flat=True)
                for item in subcategories_Q:
                    subcategories.append(str(item))


            catsubcategories = [] # содержит категорию объекта и подкатегории с префиксом _, нужно, чтобы искать объекты на фронтенде
            if urbanobjectItem.subcategories:
                subcategories_Q = urbanobjectItem.subcategories.values_list('id', flat=True)
                for item in subcategories_Q:
                    catsubcategories.append('_'+str(item))
            '''

            if urbanobjectItem.subcategories_list:
                subcategories = str(urbanobjectItem.subcategories_list).replace('"', '').split(',')
            else:
                subcategories = []


            if urbanobjectItem.subcategories_list:
                catsubcategories_ = str(urbanobjectItem.subcategories_list).replace('"', '').split(',')                
                catsubcategories = []
                for arItem in catsubcategories_:
                    catsubcategories.append('_'+str(arItem))    
            else:
                catsubcategories = []

            if urbanobjectItem.category_id:
                catsubcategories.append(str(urbanobjectItem.category_id)) # добавляет категорию объекта к catsubcategories


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
                },


                "geometry": {
                    "type": "GeometryCollection",
                    "geometries": [
                        {
                            "type": "Point",
                            "coordinates": [
                                str(urbanobjectItem.longitude),
                                str(urbanobjectItem.latitude)
                            ]
                        }
                    ]
                }


            }


            # для добавления в geometries[]
            urbanobject_Polygon = {
                "type": "Polygon",
                "coordinates": []
            }

            # будут содержаться координаты полигона
            urbanobject_PolygonCoords = []

            # добавляемв массив координаты полигона
            #if urbanobjectItem.coreurbanobjectpolygon_set.count() >=4:
            #    for polygonItem in urbanobjectItem.coreurbanobjectpolygon_set.all():
            #        urbanobject_PolygonCoords.append([str(polygonItem.longitude), str(polygonItem.latitude)])

            # добавляем координаты полигона
            urbanobject_Polygon["coordinates"].append(urbanobject_PolygonCoords)

            # добавляем геометрию полигона в geoJson
            urbanobjectJson["geometry"]["geometries"].append(urbanobject_Polygon)


            # print(treeJson)
            # print(str(treeItem.lastinsp_recommendations_list).split(', '))
            urbanobjectJsonData["features"].append(urbanobjectJson)

    return urbanobjectJsonData
