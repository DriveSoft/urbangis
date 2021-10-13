from django.urls import path
from . import views
urlpatterns = [
    path('', views.apiOverview, name="api-overview"),
    path('roadaccident/<str:city>/getdata/', views.accidentData, name="roadaccident-restapi-getdata"),
    #path('roadaccident/<str:city>/getdata2/', views.accidentData2, name="roadaccident-restapi-getdata2"),
    path('roadaccident/<str:city>/create/', views.accidentCreate, name="roadaccident-restapi-create"),
    path('roadaccident/<str:city>/update/<str:pk>/', views.accidentUpdate, name="roadaccident-restapi-update"),
    path('roadaccident/<str:city>/delete/<str:pk>/', views.accidentDelete, name="roadaccident-restapi-delete"),
    #path('roadaccident/update/', views.update),
]