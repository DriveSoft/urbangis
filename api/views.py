from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework import serializers

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied, ValidationError
from .serializers import *

from roadaccident.models import Accident, Maneuver, TypeViolation, Violator
from coregis.models import coreCity, coreUrbanObject
from citytree.models import Inspection, CareActivity, Species

from django.views.decorators.gzip import gzip_page

from django.apps import apps
import random
import string




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


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def userData(request, pk):
    if request.method == 'GET':
        obj_user = get_object_or_404(User, pk=pk)
        serializer = userGetSerializer(obj_user, many=False)
        return Response(serializer.data) 

@api_view(['POST'])
def usersData(request):
    if request.method == 'POST':
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()            
        return Response(serializer.data)         


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def userPermissionsData(request, appname):
    if request.method == 'GET':        
        data = getUserPermissions(request.user, appname)
        return Response(data) 







@api_view(['GET'])
def citiesData(request):
    cities = coreCity.objects.all().order_by('-population')
    serializer = citySerializer(cities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def citiesDataWithCountTrees(request):
    cities = coreCity.objects.all().order_by('-population')
    serializer = citySerializerWithCountTrees(cities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def citiesDataWithCountAccidents(request):
    cities = coreCity.objects.all().order_by('-population')
    serializer = citySerializerWithCountAccidents(cities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def citiesDataWithCountUrbanObjects(request):
    cities = coreCity.objects.all().order_by('-population')
    serializer = citySerializerWithCountUrbanObjects(cities, many=True)
    return Response(serializer.data)        
    

@api_view(['GET'])
def citiesDataItem(request, sysname):
    obj_city = get_object_or_404(coreCity, sysname__iexact=sysname)
    serializer = citySerializer(obj_city, many=False)
    return Response(serializer.data)




@api_view(['GET'])
def dictionaryRoadaccidentManeuvers(request):
    maneuvers = Maneuver.objects.all()
    serializer = dictionaryRoadaccidentManeuversSerializer(maneuvers, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def dictionaryRoadaccidentTypeViolations(request):
    typeViolations = TypeViolation.objects.all()
    serializer = dictionaryRoadaccidentTypeViolationsSerializer(typeViolations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def dictionaryRoadaccidentViolators(request):
    violators = Violator.objects.all()
    serializer = dictionaryRoadaccidentViolatorsSerializer(violators, many=True)
    return Response(serializer.data)        







@gzip_page
@api_view(['GET', 'POST'])
def accidentData(request, city):
    if request.method == 'GET':
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


    elif request.method == 'POST':        
        if not request.user.has_perm('roadaccident.add_accident'):
            raise PermissionDenied('You do not have enough permissions to create an entry.')

        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        serializer = roadaccidentSerializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            serializer.save(city=obj_city, useradded=request.user)
            #serializer.save(city=obj_city, useradded_id=1)

        return Response(serializer.data)        



@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def accidentItem(request, city, pk):
    print(request.user)
    if request.method == 'PUT': 
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


    elif request.method == 'DELETE':         
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



#@gzip_page
#@api_view(['GET'])
#def accidentData2(request, city):
#    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
#    return Response(roadaccidentDataToGeoJson(obj_city))  








#@api_view(['DELETE'])
#@permission_classes([IsAuthenticated])
#def accidentDelete(request, city, pk):
#    if not request.user.has_perm('roadaccident.delete_accident'):
#        raise PermissionDenied('You do not have enough permissions to delete the entry.')    
#    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
#    
#    #obj_accident = Accident.objects.get(id=pk)
#    obj_accident = get_object_or_404(Accident, pk=pk)
#    if obj_accident.useradded != request.user and not request.user.has_perm('roadaccident.can_delete_not_own_accident_record'):# and not request.user.is_staff and not request.user.is_superuser:
#        raise PermissionDenied('You do not have enough permissions to delete the entry that was created by another user.')    
#    
#    obj_accident.is_deleted=True
#    obj_accident.save() 
#    return Response('Item marked as deleted')

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
    urbanObjects = coreUrbanObject.objects.filter(city=obj_city).filter(is_deleted=False)
    serializer = coreurbanobjectSerializerList(urbanObjects, many=True)

    json = {
    "type": "FeatureCollection",
    "features": serializer.data        
    }

    return Response(json) 


#@gzip_page
#@api_view(['GET'])
#def urbanobjectData2(request, city):
#    obj_city = get_object_or_404(coreCity, sysname__iexact=city)
#    return Response(urbanobjectToGeoJson(obj_city))  


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
            serializer.validated_data['photo1'] = user_directory_path_urbanobject(request, photo1_newname)

        photo2_newname = request.data['photo2_newname']
        if photo2_newname:
            serializer.validated_data['photo2'] = user_directory_path_urbanobject(request, photo2_newname)

        photo3_newname = request.data['photo3_newname']
        if photo3_newname:
            serializer.validated_data['photo3'] = user_directory_path_urbanobject(request, photo3_newname)

        
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
                serializer.validated_data['photo1'] = user_directory_path_urbanobject(request, photo1_newname)

        photo2_newname = request.data["photo2_newname"]
        if photo2_newname:
            if photo2_newname == '*will_be_deleted*':
                serializer.validated_data['photo2'] = ''
            else:
                serializer.validated_data['photo2'] = user_directory_path_urbanobject(request, photo2_newname)

        photo3_newname = request.data["photo3_newname"]
        if photo3_newname:
            if photo3_newname == '*will_be_deleted*':
                serializer.validated_data['photo3'] = ''
            else:
                serializer.validated_data['photo3'] = user_directory_path_urbanobject(request, photo3_newname)                                


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


def user_directory_path_urbanobject(instance, filename):
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
    












@gzip_page
@api_view(['GET', 'POST'])
def citytreeData(request, city):
    if request.method == 'GET':
        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        treeObjects = Tree.objects.filter(city=obj_city).filter(is_deleted=False)
        serializer = citytreeSerializerTreeList(treeObjects, many=True)

        json = {
        "type": "FeatureCollection",
        "features": serializer.data        
        }

        return Response(json) 
    
    
    elif request.method == 'POST':            
        if not request.user.has_perm('citytree.add_tree'):
            raise PermissionDenied('You do not have enough permissions to create an entry.')

        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        serializerTree = citytreeSerializerTree(data=request.data)
        
        if serializerTree.is_valid():#raise_exception=True

            serializerFirstInsp = citytreeSerializerInspection(data=request.data['inspection'])
            
            photo1 = request.data['inspection'].pop('photo1', None)
            photo2 = request.data['inspection'].pop('photo2', None)
            photo3 = request.data['inspection'].pop('photo3', None)  

            if serializerFirstInsp.is_valid(raise_exception=True):

                print(serializerTree.validated_data)

                if photo1 != None:
                    serializerFirstInsp.validated_data['photo1'] = photo1    

                if photo2 != None:
                    serializerFirstInsp.validated_data['photo2'] = photo2 

                if photo3 != None:
                    serializerFirstInsp.validated_data['photo3'] = photo3 

                
       
                                
                tree = serializerTree.save(city=obj_city, useradded=request.user)
                serializerFirstInsp.save(tree=tree, user=request.user)


                print('ok1')
                
                # save first inspection of the object if present
                #idObject = serializer.data['id']
                #if (idObject):  
        else:
            print(serializerTree.errors)
            serializerTree.data.errors = serializerTree.errors

        print('ok2')

        return Response(serializerTree.data)        






@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def citytreeTree(request, city, pk):
    
    if request.method == 'GET': 
        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        obj_tree = get_object_or_404(Tree, pk=pk)
        serializer = citytreeSerializerGetTreeObject(obj_tree, many=False)
        return Response(serializer.data)


    elif request.method == 'PUT':    
        if not request.user.has_perm('citytree.change_tree'):
            raise PermissionDenied("You do not have sufficient permissions to change this data.")
            
        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        obj_tree = get_object_or_404(Tree, pk=pk)

        if obj_tree.useradded != request.user and not request.user.has_perm('citytree.can_change_not_own_tree_record'):
            raise PermissionDenied ('You cannot change information about the tree if this tree was added by another user.')

        serializer = citytreeSerializerTree(instance=obj_tree, data=request.data)


        if serializer.is_valid(raise_exception=True):
            """
            photo1_newname = request.data["photo1_newname"]
            if photo1_newname:
                if photo1_newname == '*will_be_deleted*':
                    serializer.validated_data['photo1'] = ''
                else:
                    serializer.validated_data['photo1'] = user_directory_path_citytree(request, photo1_newname)

            photo2_newname = request.data["photo2_newname"]
            if photo2_newname:
                if photo2_newname == '*will_be_deleted*':
                    serializer.validated_data['photo2'] = ''
                else:
                    serializer.validated_data['photo2'] = user_directory_path_citytree(request, photo2_newname)

            photo3_newname = request.data["photo3_newname"]
            if photo3_newname:
                if photo3_newname == '*will_be_deleted*':
                    serializer.validated_data['photo3'] = ''
                else:
                    serializer.validated_data['photo3'] = user_directory_path_citytree(request, photo3_newname)                                
            """
            serializer.save()

        return Response(serializer.data)


    elif request.method == 'DELETE':
        if not request.user.has_perm('citytree.delete_tree'):
            raise PermissionDenied('You do not have enough permissions to delete the entry.')    
        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        
        obj_treeobject = get_object_or_404(Tree, pk=pk)
        if obj_treeobject.useradded != request.user and not request.user.has_perm('citytree.can_delete_not_own_tree_record'):# and not request.user.is_staff and not request.user.is_superuser:
            raise PermissionDenied('You do not have enough permissions to delete the entry that was created by another user.')    
        
        obj_treeobject.is_deleted=True
        obj_treeobject.save() 
        return Response('Item marked as deleted')          





def user_directory_path_citytree(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'citytree/images_tree/user_{0}/{1}'.format(instance.user.id, filename)    

   




@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def citytreeInspections(request, city, treeid):
    if request.method == 'GET':
        tree_obj = get_object_or_404(Tree, pk=treeid)
        inspectionObjects = Inspection.objects.filter(tree=tree_obj)
        serializer = citytreeSerializerInspection(inspectionObjects, many=True)
        return Response(serializer.data)


    elif request.method == 'POST':
        if not request.user.has_perm('citytree.add_inspection'):
            raise PermissionDenied('You do not have enough permissions to create an entry.')

        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        obj_tree = get_object_or_404(Tree, pk=treeid)

        print(request.data)

        serializer = citytreeSerializerInspection(data=request.data)

        photo1 = request.data.pop('photo1', None)
        photo2 = request.data.pop('photo2', None)
        photo3 = request.data.pop('photo3', None)


        if serializer.is_valid(raise_exception=True):
            print("is_valid")

            if photo1 != None:
                serializer.validated_data['photo1'] = photo1    

            if photo2 != None:
                serializer.validated_data['photo2'] = photo2 

            if photo3 != None:
                serializer.validated_data['photo3'] = photo3                                    
            
            serializer.save(user=request.user,tree=obj_tree)
       

        return Response(serializer.data) 




@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def citytreeInspectionItem(request, city, treeid, inspid):    
    if request.method == 'PUT':
        if not request.user.has_perm('citytree.change_inspection'):
            raise PermissionDenied("You do not have sufficient permissions to change this data.")
            
        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        #obj_tree = get_object_or_404(Tree, pk=treeid)
        obj_inspection = get_object_or_404(Inspection, pk=inspid)

        if obj_inspection.user != request.user and not request.user.has_perm('citytree.can_change_not_own_insp_record'):
            raise PermissionDenied ('You cannot change information about the inspection if this inspection was added by another user.')

        serializer = citytreeSerializerInspection(instance=obj_inspection, data=request.data)

        print(request.data)
        photo1 = request.data.pop('photo1', None)
        photo2 = request.data.pop('photo2', None)
        photo3 = request.data.pop('photo3', None)


        if serializer.is_valid(raise_exception=True):
            print("is_valid")

            if photo1 != None:
                serializer.validated_data['photo1'] = photo1    

            if photo2 != None:
                serializer.validated_data['photo2'] = photo2 

            if photo3 != None:
                serializer.validated_data['photo3'] = photo3                                    
            
            serializer.save()

        return Response(serializer.data)


    elif request.method == 'DELETE':
        if not request.user.has_perm('citytree.delete_inspection'):
            raise PermissionDenied('You do not have enough permissions to delete the entry.')    
        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        
        print(inspid)
        obj_insp = get_object_or_404(Inspection, pk=inspid)
        if obj_insp.user != request.user and not request.user.has_perm('citytree.can_change_not_own_insp_record'):# and not request.user.is_staff and not request.user.is_superuser:
            raise PermissionDenied('You do not have enough permissions to delete the entry that was created by another user.')    

        print('DELETE')
        obj_insp.delete()
        return Response('Item has been deleted.')
    
    



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def citytreeActions(request, city, treeid):
    if request.method == 'GET':
        tree_obj = get_object_or_404(Tree, pk=treeid)
        actionsObjects = CareActivity.objects.filter(tree=tree_obj)
        serializer = citytreeSerializerAction(actionsObjects, many=True)
        return Response(serializer.data)


    elif request.method == 'POST':
        if not request.user.has_perm('citytree.add_careactivity'):
            raise PermissionDenied('You do not have enough permissions to create an entry.')

        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        obj_tree = get_object_or_404(Tree, pk=treeid)

        serializer = citytreeSerializerAction(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user, tree=obj_tree)        

        return Response(serializer.data) 




@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def citytreeActionItem(request, city, treeid, actionid):    
    if request.method == 'PUT':
        if not request.user.has_perm('citytree.change_careactivity'):
            raise PermissionDenied("You do not have sufficient permissions to change this data.")
            
        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        obj_tree = get_object_or_404(Tree, pk=treeid)
        obj_action = get_object_or_404(CareActivity, pk=actionid)

        if obj_action.user != request.user and not request.user.has_perm('citytree.can_change_not_own_action_record'):
            raise PermissionDenied ('You cannot change information about the action if this inspection was added by another user.')

        serializer = citytreeSerializerAction(instance=obj_action, data=request.data)


        if serializer.is_valid(raise_exception=True):
            serializer.save()

        return Response(serializer.data)   


    elif request.method == 'DELETE':
        if not request.user.has_perm('citytree.delete_careactivity'):
            raise PermissionDenied('You do not have enough permissions to delete the entry.')    
        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        
        obj_action = get_object_or_404(CareActivity, pk=actionid)
        if obj_action.user != request.user and not request.user.has_perm('citytree.can_change_not_own_action_record'):# and not request.user.is_staff and not request.user.is_superuser:
            raise PermissionDenied('You do not have enough permissions to delete the entry that was created by another user.')    

        obj_action.delete()
        return Response('Item has been deleted.')        



@api_view(['GET'])
def dictionaryCitytreeSpecies(request):
    specieses = Species.objects.order_by('localname')
    serializer = dictionaryCitytreeSpeciesSerializer(specieses, many=True)
    return Response(serializer.data)    

@api_view(['GET'])
def dictionaryCitytreeStatus(request):
    statuses = Status.objects.all()
    serializer = dictionaryCitytreeStatusSerializer(statuses, many=True)
    return Response(serializer.data)         

@api_view(['GET'])
def dictionaryCitytreeCareType(request):
    careTypes = CareType.objects.all()
    serializer = dictionaryCitytreeCareTypeSerializer(careTypes, many=True)
    return Response(serializer.data) 
    
@api_view(['GET'])
def dictionaryCitytreeRemark(request):
    remarks = Remark.objects.all()
    serializer = dictionaryCitytreeRemarkSerializer(remarks, many=True)
    return Response(serializer.data) 

@api_view(['GET'])
def dictionaryCitytreePlaceType(request):
    placeTypes = PlaceType.objects.all()
    serializer = dictionaryCitytreePlaceTypeSerializer(placeTypes, many=True)
    return Response(serializer.data) 

@api_view(['GET'])
def dictionaryCitytreeIrrigationMethod(request):
    irrigationMethods = IrrigationMethod.objects.all()
    serializer = dictionaryCitytreeIrrigationMethodSerializer(irrigationMethods, many=True)
    return Response(serializer.data)     

@api_view(['GET'])
def dictionaryCitytreeGroupSpec(request):
    groupSpecs = GroupSpec.objects.order_by('pos')
    serializer = dictionaryCitytreeGroupSpecSerializer(groupSpecs, many=True)
    return Response(serializer.data)      
    
@api_view(['GET'])
def dictionaryCitytreeTypeSpec(request):
    typeSpecs = TypeSpec.objects.all()
    serializer = dictionaryCitytreeTypeSpecSerializer(typeSpecs, many=True)
    return Response(serializer.data)     





from django.conf import settings as djangoSettings
from django.views.generic import View
import boto3
from botocore.client import Config
from pathlib import Path
from botocore.errorfactory import ClientError

def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'citytree/images_tree/user_{0}/{1}'.format(instance.user.id, filename)

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


@api_view(['POST'])
#@permission_classes([IsAuthenticatedOrReadOnly])
def getS3SignedUrl(request): 
    """
    Generate Signed url for s3
    """

    print(request.data)
    s3 = get_s3_connection()
    file_name = request.data["objectName"]

    if file_name == '':
        raise ValidationError

    # is_file_exists = False
    # is_finished = False
    # while not is_finished:
    #     if is_file_exists: 
    #         # file_name = request.data["objectName"]
    #         # #file_name = str(random.randint(0,999999)) + file_name       
    #         # splittedFilename = file_name.split('.', 1)s
    #         # file_name = splittedFilename[0] +'_'+ get_random_string(5)
    #         # if len(splittedFilename) > 1:
    #         #     file_name = file_name +'.' + splittedFilename[1]
    #         file_name = request.data["objectName"]
    #         file_name = auto_rename_name(file_name)
                
    #     final_file_name = djangoSettings.AWS_LOCATION + '/' + user_directory_path(request, file_name)
    #     print(final_file_name)

    #     #check if file exists in bucket
    #     #is_file_exists = False
    #     response = s3.list_objects_v2(Bucket=djangoSettings.AWS_STORAGE_BUCKET_NAME, Prefix=final_file_name)
    #     is_file_exists = False
    #     for obj in response.get('Contents', []):
    #         print(obj['Key'])
    #         if obj['Key'] == final_file_name:
    #             is_file_exists = True
    #             break

    #     is_finished = not is_file_exists

    final_file_name = s3_renamefile_if_exists(request, s3, file_name)

    s3Response = s3.generate_presigned_post(
        Bucket=djangoSettings.AWS_STORAGE_BUCKET_NAME,
        Key=final_file_name,
        Fields={"acl": "public-read", "Content-Type": "image/jpeg"},
        Conditions=[
            {"acl": "public-read"},
            {"Content-Type": "image/jpeg"}
        ],
        ExpiresIn=3600
    )

    # print("--------")
    # print('s3Response', s3Response)
    # print("--------")
    # print(final_file_name)
    
    # #js = s3Response["fields"]
    # #js['file'] = file_name

    # print("--------")
    # #print(js)
    # print("--------")    

    # #return Response(json.dumps(js))

    # return Response(json.dumps({
    #     'data': s3Response,
    #     #'url': 'https://%s.s3.amazonaws.com/%s' % (djangoSettings.AWS_STORAGE_BUCKET_NAME, final_file_name),
    #     'file_exists': False #is_file_exists
    # }))

    return Response(json.dumps(s3Response))



def get_random_string(length):
    # choose from all lowercase letter
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def auto_rename_name(filename):
    splittedFilename = filename.split('.', 1)
    newFilename = splittedFilename[0] +'_'+ get_random_string(5)
    if len(splittedFilename) > 1:
        newFilename = newFilename +'.' + splittedFilename[1]
    return newFilename

def s3_renamefile_if_exists(request, s3, filename):
    validFilename = filename
    is_file_exists = False
    is_finished = False
    while not is_finished:
        if is_file_exists: 
            validFilename = auto_rename_name(filename)
                
        final_file_name = djangoSettings.AWS_LOCATION + '/' + user_directory_path(request, validFilename)
        print(final_file_name)

        #check if file exists in bucket
        response = s3.list_objects_v2(Bucket=djangoSettings.AWS_STORAGE_BUCKET_NAME, Prefix=final_file_name)
        is_file_exists = False
        for obj in response.get('Contents', []):
            print(obj['Key'])
            if obj['Key'] == final_file_name:
                is_file_exists = True
                break

        is_finished = not is_file_exists

    return final_file_name    

