from django.urls import path
from . import views
urlpatterns = [
    path('', views.apiOverview, name="api-overview"),
    path('roadaccident/<str:city>/getdata/', views.accidentData, name="roadaccident-restapi-getdata"),
    path('roadaccident/update/', views.update),
]