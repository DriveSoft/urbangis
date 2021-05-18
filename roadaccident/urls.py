from django.urls import path

from .views import *

urlpatterns = [
    path('test/', Test.as_view()),
    path('import/', PtpImport.as_view(), name='ptp_import'),
    path('testdata/', create_accidents.as_view()),
    path('<str:city_name>/deleteall/', DeleteAll.as_view()),
    path('<str:city_name>/', Map.as_view(), name='roadaccident_map_url'),
    path('<str:city_name>/geojson/', getGeojson.as_view(), name='roadaccident_geojson_get'),

]