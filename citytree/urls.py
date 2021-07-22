from django.urls import path
from .views import *


urlpatterns = [
    path('bulk/', create_trees),
    path('<str:city_name>/', Map.as_view(), name='citytree_map_url'),
    #path('<str:city_name>/export/', ExportGeoJson.as_view()),
    path('<str:city_name>/opendata/', OpenData, name='open_data'),
    #path('<str:city_name>/deleteall/', DeleteAllTrees.as_view()),
    path('<str:city_name>/geojson/', getGeojson.as_view(), name='citytree_geojson_get'),
    path('get/ajax/inspact/', ajaxGetInspAct.as_view(), name = "get_inspact"),
    path('get/ajax/tree/', ajaxGetTree.as_view(), name = "get_tree"),
    path('get/ajax/setmapname/', ajaxSetMapName.as_view(), name = "set_mapname"),

    path('get/ajax/generate_signed_url/', GetS3SignedUrl.as_view(), name='generate_signed_url'),

]


