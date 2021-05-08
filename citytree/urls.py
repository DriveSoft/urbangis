from django.urls import path
from .views import *


urlpatterns = [
    path('bulk/', create_trees),
    path('<str:city_name>/', Map.as_view(), name='citytree_map_url'),
    path('<str:city_name>/export/', ExportGeoJson.as_view()),
    path('<str:city_name>/deleteall/', DeleteAllTrees.as_view()),
    path('get/ajax/inspact', ajaxGetInspAct.as_view(), name = "get_inspact"),

]


