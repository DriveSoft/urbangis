from django.urls import path

from .views import *
#from .data import *

urlpatterns = [

    path('<str:city_name>/', Map.as_view(), name='urbanobject_map_url'),
    path('<str:city_name>/object/<int:object_id>/', Map.as_view(), name='urbanobject_map_url'),

    path('<str:city_name>/geojson/', getGeojson.as_view(), name='urbanobject_geojson_get'),
    path('get/ajax/object/', getUrbanObject.as_view(), name = "get_urban_object"),
    path('get/ajax/generate_signed_url/', GetS3SignedUrl.as_view(), name='generate_signed_url_urbanobj'),
    path('get/ajax/setmapname/', ajaxSetMapName.as_view(), name = "set_mapname"),

]