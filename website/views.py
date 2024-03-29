from math import ceil
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.views.generic import View
from django.contrib.auth.forms import UserCreationForm
from .forms import CreateUserForm
from django.contrib import messages #если хотим показывать сообщения, например об успешной регистрации
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import Group
from django.contrib.auth.decorators import login_required
from coregis.models import coreCity




def home(request):
    obj_all_cities = coreCity.objects.all().order_by('-population')
    context = {'obj_all_cities': obj_all_cities}
    return render(request, 'website/index.html', context)


def citytree(request):
    obj_all_cities = coreCity.objects.all().order_by('-population')
    context = {'obj_all_cities': obj_all_cities}

    count_cities = coreCity.objects.count()
    all_cities1 = coreCity.objects.all().order_by('-population')[:ceil(count_cities/2)]
    all_cities2 = coreCity.objects.all().order_by('-population')[ceil(count_cities/2):]
    context = {'all_cities1': all_cities1, 'all_cities2': all_cities2}

    return render(request, 'website/citytree.html', context)


def trees(request):
    return render(request, 'website/trees.html')



def urbanobject(request):
    #obj_all_cities = coreCity.objects.all().order_by('-population')
    #context = {'obj_all_cities': obj_all_cities}

    count_cities = coreCity.objects.count()
    all_cities1 = coreCity.objects.all().order_by('-population')[:ceil(count_cities/2)]
    all_cities2 = coreCity.objects.all().order_by('-population')[ceil(count_cities/2):]
    context = {'all_cities1': all_cities1, 'all_cities2': all_cities2}

    return render(request, 'website/urbanobject.html', context)








def registerPage(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        form = CreateUserForm()

        if request.method == 'POST':
            form = CreateUserForm(request.POST)
            if form.is_valid():
                obj_user = form.save()
                default_group = Group.objects.get(name='Default')
                obj_user.groups.add(default_group)
                messages.success(request, 'Account was created for ' + obj_user.username)
                return redirect('login')



        context = {'form': form}
        return render(request, 'website/register.html', context)




def loginPage(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                next_page = request.GET.get('next')
                if next_page:
                    return HttpResponseRedirect(next_page)
                else:
                    return redirect('home')
            else:
                messages.info(request, 'Username or Password is incorrect')

        context = {}
        return render(request, 'website/login.html', context)




def logoutUser(request):
    logout(request)
    return redirect('login')




def RedirectToIndex(request):
    return redirect('home')
