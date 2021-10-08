from django.urls import path
from . import views
urlpatterns = [
    path('', views.apiOverview, name="api-overview"),
    path('roadaccident/<str:city>/getdata/', views.accidentData, name="roadaccident-data"),
    path('roadaccident2/<str:city>/getdata/', views.accidentData2, name="roadaccident-data2"),
]