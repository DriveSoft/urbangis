from django.urls import path

from .views import *

urlpatterns = [
    path('test/', Test.as_view()),
    path('import/', PtpImport.as_view(), name='ptp_import'),

    path('<str:city_name>/', Map.as_view(), name='roadaccident_map_url'),

]