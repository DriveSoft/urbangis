from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework import serializers

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .serializers import *

from roadaccident.models import Accident
from coregis.models import coreCity, coreUrbanObject

from django.views.decorators.gzip import gzip_page


@api_view(['GET'])
def apiOverviewRoadaccident(request):
    api_urls = {
        'Road accident data':'/roadaccident/<str:city>/getdata/',
        'List': '/task-list/',
        'Detail View':'/task-detail/<str:pk>/',
        'Create':'/task-create',
        'Update':'/task_update/<str:pk>/',
        'Delete':'/task-delete/<str:pk>/',
    }
    return Response(api_urls)




@gzip_page
@api_view(['GET'])
def accidentData(request, city):
    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    accidents = Accident.objects.filter(city=obj_city).filter(is_deleted=False)
    serializer = roadaccidentSerializerList(accidents, many=True)

    json = {
    "type": "FeatureCollection",
    "city": {
        "name": obj_city.sysname,
        "coordinates": [
            str(obj_city.longitude),
            str(obj_city.latitude)
        ]
    },
    "features": serializer.data        
    }

    return Response(json) 



#@gzip_page
#@api_view(['GET'])
#def accidentData2(request, city):
#    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
#    return Response(roadaccidentDataToGeoJson(obj_city))  


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accidentCreate(request, city):
    if not request.user.has_perm('roadaccident.add_accident'):
        raise PermissionDenied('You do not have enough permissions to create an entry.')

    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    serializer = roadaccidentSerializer(data=request.data)

    if serializer.is_valid(raise_exception=True):
        serializer.save(city=obj_city, useradded=request.user)

    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accidentUpdate(request, city, pk):
    if not request.user.has_perm('roadaccident.change_accident'):
        raise PermissionDenied("You do not have sufficient permissions to change this data.")
        
    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    #obj_accident = Accident.objects.get(id=pk)
    obj_accident = get_object_or_404(Accident, pk=pk)

    if obj_accident.useradded != request.user and not request.user.has_perm('roadaccident.can_change_not_own_accident_record'):
        raise PermissionDenied ('You cannot change information about the accident if this accident was added by another user.')

    serializer = roadaccidentSerializer(instance=obj_accident, data=request.data)

    if serializer.is_valid(raise_exception=True):
        serializer.save()

    return Response(serializer.data)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def accidentDelete(request, city, pk):
    if not request.user.has_perm('roadaccident.delete_accident'):
        raise PermissionDenied('You do not have enough permissions to delete the entry.')    
    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    
    #obj_accident = Accident.objects.get(id=pk)
    obj_accident = get_object_or_404(Accident, pk=pk)
    if obj_accident.useradded != request.user and not request.user.has_perm('roadaccident.can_delete_not_own_accident_record'):# and not request.user.is_staff and not request.user.is_superuser:
        raise PermissionDenied('You do not have enough permissions to delete the entry that was created by another user.')    
    
    obj_accident.is_deleted=True
    obj_accident.save() 
    return Response('Item marked as deleted')

    '''
    serializer = AccidentSerializer(instance=obj_accident, data=request.data)

    if serializer.is_valid():
        serializer.save(is_deleted=True)
    else:
        print('not valid')
        print(serializer.data)

    return Response(serializer.data)
    '''




'''
def update(request):
    accidents = Accident.objects.all()
    for ac_item in accidents:
        obj_violators = ac_item.violators.all()
        s = ''
        for item in obj_violators:
            s = s + '"' + str(item.id) + '",'
        
        s = s.rstrip(',')
        ac_item.violators_list = s        
        ac_item.save()       

        obj_violations_type = ac_item.violations_type.all()
        s = ''
        for item in obj_violations_type:
            s = s + '"' + str(item.id) + '",'
        
        s = s.rstrip(',')
        ac_item.violations_type_list = s        
        ac_item.save() 
'''




'''
@gzip_page
@api_view(['GET'])
def accidentData(request, city):
    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    #accidents = Accident.objects.filter(city=obj_city).filter(is_deleted=False)
    #serializer = AccidentSerializer(accidents, many=True)
    #return Response(serializer.data)

    return Response(citydataToGeoJson(obj_city))


@gzip_page
@api_view(['GET'])
def accidentData2(request, city):
    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    accidents = Accident.objects.filter(city=obj_city).filter(is_deleted=False)
    serializer = AccidentSerializer(accidents, many=True)
    return Response(serializer.data)   
'''


  

  




@api_view(['GET'])
def apiOverviewUrbanobject(request):
    api_urls = {
        'Road accident data':'/roadaccident/<str:city>/getdata/',
        'List': '/task-list/',
        'Detail View':'/task-detail/<str:pk>/',
        'Create':'/task-create',
        'Update':'/task_update/<str:pk>/',
        'Delete':'/task-delete/<str:pk>/',
    }
    return Response(api_urls)


@gzip_page
@api_view(['GET'])
def urbanobjectData(request, city):
    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    return Response(urbanobjectToGeoJson(obj_city))  


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def urbanobjectCreate(request, city):
    if not request.user.has_perm('coreurbanobject.add_coreurbanobject'):
        raise PermissionDenied('You do not have enough permissions to create an entry.')

    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    serializer = coreurbanobjectSerializer(data=request.data)

    if serializer.is_valid(raise_exception=True):

        photo1_newname = request.data['photo1_newname']
        if photo1_newname:
            serializer.validated_data['photo1'] = user_directory_path(request, photo1_newname)

        photo2_newname = request.data['photo2_newname']
        if photo2_newname:
            serializer.validated_data['photo2'] = user_directory_path(request, photo2_newname)

        photo3_newname = request.data['photo3_newname']
        if photo3_newname:
            serializer.validated_data['photo3'] = user_directory_path(request, photo3_newname)

        
        serializer.save(city=obj_city, useradded=request.user)
        
        # save polygon of the object if present
        idObject = serializer.data['id']
        if (idObject):
            if 'polygon' in request.data:
                arPolygon = request.data['polygon']
                if len(arPolygon) >= 3: # if there is 3 coords or more
                    for coord in arPolygon:
                        coreUrbanObjectPolygon.objects.create(latitude=coord['latitude'], longitude=coord['longitude'], object_id=idObject)
                    coord = arPolygon[0]
                    coreUrbanObjectPolygon.objects.create(latitude=coord['latitude'], longitude=coord['longitude'], object_id=idObject)
                

    return Response(serializer.data)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def urbanobjectUpdate(request, city, pk):
    if not request.user.has_perm('coreurbanobject.change_coreurbanobject'):
        raise PermissionDenied("You do not have sufficient permissions to change this data.")
        
    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    obj_urbanobject = get_object_or_404(coreUrbanObject, pk=pk)

    if obj_urbanobject.useradded != request.user and not request.user.has_perm('coreurbanobject.can_change_not_own_object_record'):
        raise PermissionDenied ('You cannot change information about the object if this object was added by another user.')

    serializer = coreurbanobjectSerializer(instance=obj_urbanobject, data=request.data)


    if serializer.is_valid(raise_exception=True):

        photo1_newname = request.data["photo1_newname"]
        if photo1_newname:
            if photo1_newname == '*will_be_deleted*':
                serializer.validated_data['photo1'] = ''
            else:
                serializer.validated_data['photo1'] = user_directory_path(request, photo1_newname)

        photo2_newname = request.data["photo2_newname"]
        if photo2_newname:
            if photo2_newname == '*will_be_deleted*':
                serializer.validated_data['photo2'] = ''
            else:
                serializer.validated_data['photo2'] = user_directory_path(request, photo2_newname)

        photo3_newname = request.data["photo3_newname"]
        if photo3_newname:
            if photo3_newname == '*will_be_deleted*':
                serializer.validated_data['photo3'] = ''
            else:
                serializer.validated_data['photo3'] = user_directory_path(request, photo3_newname)                                


        serializer.save()


        # save polygon of the object if present
        idObject = serializer.data['id']
        if (idObject):
            if request.data['polygonCoords'] == 'delete':
                coreUrbanObjectPolygon.objects.filter(object=obj_urbanobject).delete() 

            if 'polygon' in request.data:
                arPolygon = request.data['polygon']
                if len(arPolygon) >= 3: # if there is 3 coords or more
                    coreUrbanObjectPolygon.objects.filter(object=obj_urbanobject).delete() 
                    for coord in arPolygon:
                        coreUrbanObjectPolygon.objects.create(latitude=coord['latitude'], longitude=coord['longitude'], object_id=idObject)
                    coord = arPolygon[0]
                    coreUrbanObjectPolygon.objects.create(latitude=coord['latitude'], longitude=coord['longitude'], object_id=idObject)


    return Response(serializer.data)


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'urbanobject/images_object/user_{0}/{1}'.format(instance.user.id, filename)




@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def urbanobjectDelete(request, city, pk):
    if not request.user.has_perm('coreurbanobject.delete_coreurbanobject'):
        raise PermissionDenied('You do not have enough permissions to delete the entry.')    
    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    
    obj_urbanobject = get_object_or_404(coreUrbanObject, pk=pk)
    if obj_urbanobject.useradded != request.user and not request.user.has_perm('coreurbanobject.can_delete_not_own_object_record'):# and not request.user.is_staff and not request.user.is_superuser:
        raise PermissionDenied('You do not have enough permissions to delete the entry that was created by another user.')    
    
    obj_urbanobject.is_deleted=True
    obj_urbanobject.save() 
    return Response('Item marked as deleted')



@api_view(['GET'])
def urbanobjectGetObject(request, city, pk):
    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    obj_urbanobject = get_object_or_404(coreUrbanObject, pk=pk)
    serializer = coreurbanobjectSerializerGetObject(obj_urbanobject, many=False)
    return Response(serializer.data)




'''
def update(request):
    urbanobjects = coreUrbanObject.objects.all()
    for uo_item in urbanobjects:
        obj_subcats = uo_item.subcategories.all()
        s = ''
        for item in obj_subcats:
            s = s + '"' + str(item.id) + '",'
        
        s = s.rstrip(',')
        uo_item.subcategories_list = s        
        uo_item.save()       
'''
    
