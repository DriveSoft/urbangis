from django.urls import path
from . import views
from .views import MyTokenObtainPairView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

urlpatterns = [
    path('users/', views.usersData, name='api-users'),
    path('users/<str:pk>/', views.userData, name='api-user-item'),

    #path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),    
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    path('cities/', views.citiesData, name="api-cities"),
    path('cities/<str:sysname>/', views.citiesDataItem, name="api-cities-item"),

    path('dictionary/roadaccident/maneuvers/', views.dictionaryRoadaccidentManeuvers, name="api-dictionary-roadaccident-maneuvers"),
    path('dictionary/roadaccident/typeviolations/', views.dictionaryRoadaccidentTypeViolations, name="api-dictionary-roadaccident-typeviolations"),
    path('dictionary/roadaccident/violators/', views.dictionaryRoadaccidentViolators, name="api-dictionary-roadaccident-violators"),


    path('roadaccident/', views.apiOverviewRoadaccident, name="api-overview-roadaccident"),
    path('roadaccident/<str:city>/accidents/', views.accidentData, name="roadaccident-restapi"),
    path('roadaccident/<str:city>/accidents/<str:pk>/', views.accidentItem, name="roadaccident-restapi-item"),

    #path('roadaccident/update/', views.update),

    path('urbanobject/', views.apiOverviewUrbanobject, name="api-overview-urbanobject"),
    path('urbanobject/<str:city>/getdata/', views.urbanobjectData, name="urbanobject-restapi-getdata"),
    #path('urbanobject/<str:city>/getdata2/', views.urbanobjectData, name="urbanobject-restapi-getdata2"),
    path('urbanobject/<str:city>/create/', views.urbanobjectCreate, name="urbanobject-restapi-create"),
    path('urbanobject/<str:city>/update/<str:pk>/', views.urbanobjectUpdate, name="urbanobject-restapi-update"),
    path('urbanobject/<str:city>/delete/<str:pk>/', views.urbanobjectDelete, name="urbanobject-restapi-delete"),
    path('urbanobject/<str:city>/object/<str:pk>/', views.urbanobjectGetObject, name="urbanobject-restapi-getobject"),
    #path('urbanobject/update/', views.update),

    path('citytree/<str:city>/trees/', views.citytreeData, name="citytree-restapi-trees"),
    path('citytree/<str:city>/trees/<str:pk>/', views.citytreeTree, name="citytree-restapi-treeitem"),    
    path('citytree/<str:city>/trees/<str:treeid>/inspections/', views.citytreeInspections, name="citytree-restapi-inspections"),
    path('citytree/<str:city>/trees/<str:treeid>/inspections/<str:inspid>/', views.citytreeInspectionItem, name="citytree-restapi-inspection-item"),
    path('citytree/<str:city>/trees/<str:treeid>/actions/', views.citytreeActions, name="citytree-restapi-actions"),
    path('citytree/<str:city>/trees/<str:treeid>/actions/<str:actionid>/', views.citytreeActionItem, name="citytree-restapi-action-item"),    

]