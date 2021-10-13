from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework import serializers

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .serializers import *

from roadaccident.models import Accident
from coregis.models import coreCity

from django.views.decorators.gzip import gzip_page


@api_view(['GET'])
def apiOverview(request):
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
    return Response(roadaccidentDataToGeoJson(obj_city))  



#@gzip_page
#@api_view(['GET'])
#def accidentData2(request, city):
#    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
#    accidents = Accident.objects.filter(city=obj_city).filter(is_deleted=False)
#    serializer = AccidentSerializer(accidents, many=True)
#    return Response(serializer.data) 


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accidentCreate(request, city):
    if not request.user.has_perm('roadaccident.add_accident'):
        raise PermissionDenied('You do not have enough permissions to create an entry.')

    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
    serializer = AccidentSerializer(data=request.data)

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

    serializer = AccidentSerializer(instance=obj_accident, data=request.data)

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


  

  