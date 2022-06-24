from django.urls import path, re_path
from .views import *
from django.views.generic import TemplateView

urlpatterns = [
    re_path('.*', TemplateView.as_view(template_name='citytree.html')),

    path('<str:city_name>/', Map.as_view(), name='citytree_map_url'),
    path('<str:city_name>/opendata/', OpenData, name='open_data'),
    path('<str:city_name>/geojson/', getGeojson.as_view(), name='citytree_geojson_get'),
    path('<str:city_name>/updatestat/', statUpdate, name='citytree_stat_update'),
    path('<str:city_name>/ajaxgetstat/', statGet, name='citytree_ajax_getstat'),

    path('<str:city_name>/tree/<int:tree_id>/', Map.as_view(), name='citytree_map_url'),


    path('get/ajax/inspact/', ajaxGetInspAct.as_view(), name = "get_inspact"),
    path('get/ajax/tree/', ajaxGetTree.as_view(), name = "get_tree"),
    path('get/ajax/setmapname/', ajaxSetMapName.as_view(), name = "set_mapname"),
    path('get/ajax/generate_signed_url/', GetS3SignedUrl.as_view(), name='generate_signed_url'),
    #path('<str:city_name>/export/', ExportGeoJson.as_view()),
    #path('<str:city_name>/deleteall/', DeleteAllTrees.as_view()),
    #path('bulk/', create_trees),
]


