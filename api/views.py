from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework import serializers

from rest_framework.decorators import api_view
from rest_framework.response import Response
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


  

  