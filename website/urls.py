from django.urls import path, re_path
from django.views.generic import TemplateView
from . import views


urlpatterns = [
    re_path('.*', TemplateView.as_view(template_name='website.html')),

    # path('', views.RedirectToIndex),
    # path('website/', views.home, name="home"),

    # path('website/citytree/', views.citytree, name="website_citytree"),
    # path('website/citytree/trees/', views.trees, name="website_citytree_trees"),

    # path('website/urbanobject/', views.urbanobject, name="website_urbanobject"),

     path('register/', views.registerPage, name="register"),
     path('login/', views.loginPage, name="login"),
     path('logout/', views.logoutUser, name="logout"),
     path('logout/', views.logoutUser, name="logout"),

]