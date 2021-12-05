from rest_framework import serializers
from roadaccident.models import Accident
from coregis.models import coreUrbanObject, coreUrbanObjectPolygon
from citytree.models import Tree, Inspection, CareActivity

import json
import os
#from django.conf import settings as djangoSettings
#from django.core.files import File



class roadaccidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accident
        fields = '__all__'
        read_only_fields = ['city', 'useradded', 'is_deleted', 'violations_type_list', 'violators_list'] #set this fields on backend in a view or like signals


class roadaccidentSerializerList(serializers.ModelSerializer):
    class Meta:
        model = Accident
        exclude = ['city', 'violators', 'violations_type', 'violations_type_list', 'violators_list', 'is_deleted']

    def to_representation(self, instance): #modify json output
        data = {
            'properties': super(roadaccidentSerializerList, self).to_representation(instance)
        }


        data['properties']['coordinates'] = [
                str(instance.longitude),
                str(instance.latitude)
            ]
        
        data['properties']['datetime'] = instance.datetime.strftime("%Y-%m-%dT%H:%M")

        if instance.violations_type_list:
            data['properties']['violations_type'] = str(instance.violations_type_list).replace('"', '').split(',')
        else:
            data['properties']['violations_type'] = []

        if instance.violators_list:
            data['properties']['violators'] = str(instance.violators_list).replace('"', '').split(',')
        else:
            data['properties']['violators'] = []   

        
        data['type'] = 'Feature'

        data['geometry'] = {
            'type': 'Point',
            'coordinates': [
                str(instance.longitude),
                str(instance.latitude)
            ]
        }

        return data






class coreurbanobjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = coreUrbanObject
        fields = '__all__'
        read_only_fields = ['city', 'useradded', 'is_deleted', 'subcategories_list'] #set this fields on backend in a view or like signals



class coreurbanobjectSerializerList(serializers.ModelSerializer):
    class Meta:
        model = coreUrbanObject
        exclude = ['city', 'is_deleted', 'subcategories']

    def to_representation(self, instance): #modify json output
        data = {
            'properties': super(coreurbanobjectSerializerList, self).to_representation(instance)
        }


        data['properties']['coordinates'] = [
                str(instance.longitude),
                str(instance.latitude)
            ]

        if instance.subcategories_list:
            data['properties']['subcategories'] = str(instance.subcategories_list).replace('"', '').split(',')
        else:
            data['properties']['subcategories'] = []


        if instance.subcategories_list:
            catsubcategories_ = str(instance.subcategories_list).replace('"', '').split(',')                
            data['properties']['catsubcategories'] = []
            for arItem in catsubcategories_:
                data['properties']['catsubcategories'].append('_'+str(arItem))    
        else:
            data['properties']['catsubcategories'] = []

        if instance.category_id:
            data['properties']['catsubcategories'].append(str(instance.category_id)) # добавляет категорию объекта к catsubcategories
 
        data['properties']['icon'] = instance.category.icon

        
        data['type'] = 'Feature'

        data['geometry'] = {
            'type': 'GeometryCollection',
            'geometries': [
                {
                    'type': 'Point',
                    'coordinates': [
                        str(instance.longitude),
                        str(instance.latitude)
                    ]
                }
            ]
        }


        # будут содержаться координаты полигона
        urbanobject_PolygonCoords = []

        # добавляемв массив координаты полигона
        # !!! если переделать в сигнал, чтобы сохранялась копия полигонов в отдельном поле главной таблицы, то будет загружаться еще почти в 2 раза быстрей
        if instance.coreurbanobjectpolygon_set.count() >=4:
            for polygonItem in instance.coreurbanobjectpolygon_set.all():
                urbanobject_PolygonCoords.append([str(polygonItem.longitude), str(polygonItem.latitude)])        

        # добавляем координаты полигона
        urbanobject_Polygon = {
            "type": "Polygon",
            "coordinates": []
        }
        urbanobject_Polygon["coordinates"].append(urbanobject_PolygonCoords)

        data['geometry']['geometries'].append(urbanobject_Polygon)


        return data




class coreurbanobjectSerializerGetObject(serializers.ModelSerializer):
    class Meta:
        model = coreUrbanObject
        fields = '__all__'

    def to_representation(self, instance): #modify json output
        data = super(coreurbanobjectSerializerGetObject, self).to_representation(instance)
        if instance.coreurbanobjectpolygon_set.count() >= 4: 
            data['polygon_exists'] = True
        else:
            data['polygon_exists'] = False    

        data['category_id'] = data['category']
        data['category'] = instance.category.catname
        data['subcategories_text'] = ', '.join(instance.subcategories.values_list('subcatname', flat=True))
        
        return data







class citytreeSerializerGetTreeObject(serializers.ModelSerializer):
    class Meta:
        model = Tree
        #fields = '__all__'
        exclude = ['is_moderated', 'is_reservedplace', 'is_geojsoned', 'usermoderated']

    def to_representation(self, instance): #modify json output
        data = super(citytreeSerializerGetTreeObject, self).to_representation(instance)
  
        data['species_id'] = data['species']
        data['species'] = instance.species.speciesname
        data['localname'] = instance.species.localname
        
        
        if instance.lastinsp_status:
            data['lastinsp_status'] = instance.lastinsp_status.statusname
        else:
            data['lastinsp_status'] = None

        if instance.lastinsp_remarks:
            data['lastinsp_remarks'] = ', '.join(instance.lastinsp_remarks.values_list('remarkname', flat=True))
        else:
            data['lastinsp_remarks'] = None

        if instance.lastinsp_recommendations:            
            data['lastinsp_recommendations'] = ', '.join(instance.lastinsp_recommendations.values_list('carename', flat=True))
        else:
            data['lastinsp_recommendations'] = None        
        
        data['id'] = instance.id
        return data




class citytreeSerializerInspection(serializers.ModelSerializer):
    class Meta:
        model = Inspection
        fields = '__all__'
        read_only_fields = ['tree', 'user']


class citytreeSerializerTree(serializers.ModelSerializer):
    class Meta:
        model = Tree
        fields = '__all__'
        read_only_fields = ['city', 'useradded', 'is_deleted', 'lastinsp_datetime', 'lastinsp_comment', 'lastinsp_crowndiameter', 'lastinsp_trunkgirth',
                            'lastinsp_height', 'lastinsp_status', 'lastinsp_photo1', 'lastinsp_photo2', 'lastinsp_photo3', 
                            'lastinsp_remarks_list', 'lastinsp_recommendations_list', 'lastinsp_remarks_text', 'lastinsp_recommendations_text', 'is_geojsoned']

                    



class citytreeSerializerTreeList(serializers.ModelSerializer):
    class Meta:
        model = Tree
        exclude = ['city', 'datetimeadded', 'googlestreeturl', 'is_reservedplace', 'lastinsp_comment', 'lastinsp_photo1', 'lastinsp_photo2', 'lastinsp_photo3', 
                    'lastinsp_remarks', 'lastinsp_recommendations', 'lastinsp_remarks_list', 'lastinsp_recommendations_list', 
                    'lastinsp_remarks_text', 'lastinsp_recommendations_text', 'lastinsp_datetime', 'speciescomment', 
                    'usermoderated', 'is_geojsoned', 'is_deleted', 'is_moderated']

    def to_representation(self, instance): #modify json output
        data = {
            'properties': super(citytreeSerializerTreeList, self).to_representation(instance)
        }


        data['properties']['coordinates'] = [
                str(instance.longitude),
                str(instance.latitude)
            ]
        
        data['properties']['datetimeadded'] = instance.datetimeadded.strftime("%Y-%m-%d")

        if instance.lastinsp_remarks_list:
            data['properties']['remarks'] = str(instance.lastinsp_remarks_list).replace('"', '').split(',')
        else:
            data['properties']['remarks'] = []

        if instance.lastinsp_recommendations_list:
            data['properties']['recommendations'] = str(instance.lastinsp_recommendations_list).replace('"', '').split(',')
        else:
            data['properties']['recommendations'] = []   

        
        data['type'] = 'Feature'

        data['geometry'] = {
            'type': 'Point',
            'coordinates': [
                str(instance.longitude),
                str(instance.latitude)
            ]
        }

        return data







class citytreeSerializerAction(serializers.ModelSerializer):
    class Meta:
        model = CareActivity
        fields = '__all__'
        read_only_fields = ['tree', 'user']




'''
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
            # !!! если переделать в сигнал, чтобы сохранялась копия полигонов в отдельном поле главной таблицы, то будет загружаться еще почти в 2 раза быстрей
            if urbanobjectItem.coreurbanobjectpolygon_set.count() >=4:
                for polygonItem in urbanobjectItem.coreurbanobjectpolygon_set.all():
                    urbanobject_PolygonCoords.append([str(polygonItem.longitude), str(polygonItem.latitude)])

            # добавляем координаты полигона
            urbanobject_Polygon["coordinates"].append(urbanobject_PolygonCoords)

            # добавляем геометрию полигона в geoJson
            urbanobjectJson["geometry"]["geometries"].append(urbanobject_Polygon)


            # print(treeJson)
            # print(str(treeItem.lastinsp_recommendations_list).split(', '))
            urbanobjectJsonData["features"].append(urbanobjectJson)

    return urbanobjectJsonData
