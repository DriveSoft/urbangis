from django.urls import path
from . import views

urlpatterns = [
    path('roadaccident/', views.apiOverviewRoadaccident, name="api-overview-roadaccident"),
    path('roadaccident/<str:city>/getdata/', views.accidentData, name="roadaccident-restapi-getdata"),
    #path('roadaccident/<str:city>/getdata2/', views.accidentData2, name="roadaccident-restapi-getdata2"),
    path('roadaccident/<str:city>/create/', views.accidentCreate, name="roadaccident-restapi-create"),
    path('roadaccident/<str:city>/update/<str:pk>/', views.accidentUpdate, name="roadaccident-restapi-update"),
    path('roadaccident/<str:city>/delete/<str:pk>/', views.accidentDelete, name="roadaccident-restapi-delete"),
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