from django.urls import path
from django.views.generic import TemplateView
from . import views


urlpatterns = [
    path('', views.RedirectToIndex),
    path('website/', views.home, name="home"),
    path('website/citytree/', TemplateView.as_view(template_name='website/citytree.html'), name='website_citytree'),
    path('register/', views.registerPage, name="register"),
    path('login/', views.loginPage, name="login"),
    path('logout/', views.logoutUser, name="logout"),
    path('logout/', views.logoutUser, name="logout"),

]