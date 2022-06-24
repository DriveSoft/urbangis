from django.urls import re_path, path
from .views import *
#from .data import *
from django.views.generic import TemplateView

urlpatterns = [
    re_path('.*', TemplateView.as_view(template_name='roadaccident.html')), 
    path('<str:city_name>/', Map.as_view(), name='roadaccident_map_url'),
    path('get/ajax/setmapname/', ajaxSetMapName.as_view(), name = "set_mapname"),



    #path('test/', Test.as_view()),
    #path('import/', PtpImport.as_view(), name='ptp_import'),
    #path('testdata/', create_accidents.as_view()),
    #path('<str:city_name>/deleteall/', DeleteAll.as_view()),    
    #path('<str:city_name>/geojson/', getGeojson.as_view(), name='roadaccident_geojson_get'),    
    #path('<str:city_name>/import/', import_ptp),
    #path('<str:city_name>/deleteall/', DeleteAllPtp),



]