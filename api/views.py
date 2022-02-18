from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework import serializers

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from .serializers import *

from roadaccident.models import Accident, Maneuver, TypeViolation, Violator
from coregis.models import coreCity, coreUrbanObject
from citytree.models import Inspection, CareActivity

from django.views.decorators.gzip import gzip_page

from django.apps import apps




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
def citiesData(request):
    cities = coreCity.objects.all().order_by('-population')
    serializer = citySerializer(cities, many=True)
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
            if serializerFirstInsp.is_valid(raise_exception=True):


                print(serializerTree.validated_data)

                photo1_newname = request.data['inspection']['photo1_newname']
                if photo1_newname:
                    serializerFirstInsp.validated_data['photo1'] = user_directory_path_citytree(request, photo1_newname)

                photo2_newname = request.data['inspection']['photo2_newname']
                if photo2_newname:
                    serializerFirstInsp.validated_data['photo2'] = user_directory_path_citytree(request, photo2_newname)

                photo3_newname = request.data['inspection']['photo3_newname']
                if photo3_newname:
                    serializerFirstInsp.validated_data['photo3'] = user_directory_path_citytree(request, photo3_newname)

                
                #serializer2.validated_data['user_id'] = request.user.id
                                
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

        serializer = citytreeSerializerInspection(data=request.data)

        if serializer.is_valid():
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


            serializer.save(user=request.user,tree=obj_tree)        

        return Response(serializer.data) 




@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def citytreeInspectionItem(request, city, treeid, inspid):    
    if request.method == 'PUT':
        if not request.user.has_perm('citytree.change_inspection'):
            raise PermissionDenied("You do not have sufficient permissions to change this data.")
            
        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        obj_tree = get_object_or_404(Tree, pk=treeid)
        obj_inspection = get_object_or_404(Inspection, pk=inspid)

        if obj_inspection.user != request.user and not request.user.has_perm('citytree.can_change_not_own_insp_record'):
            raise PermissionDenied ('You cannot change information about the inspection if this inspection was added by another user.')

        serializer = citytreeSerializerInspection(instance=obj_inspection, data=request.data)


        if serializer.is_valid(raise_exception=True):

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


            serializer.save()

        return Response(serializer.data)


    elif request.method == 'DELETE':
        if not request.user.has_perm('citytree.delete_inspection'):
            raise PermissionDenied('You do not have enough permissions to delete the entry.')    
        obj_city = get_object_or_404(coreCity, sysname__iexact=city)
        
        obj_insp = get_object_or_404(Inspection, pk=inspid)
        if obj_insp.user != request.user and not request.user.has_perm('citytree.can_change_not_own_insp_record'):# and not request.user.is_staff and not request.user.is_superuser:
            raise PermissionDenied('You do not have enough permissions to delete the entry that was created by another user.')    

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