from django.contrib.auth.decorators import login_required
from django.shortcuts import render


def register(request):
    return render(request, 'travel/register.html')


@login_required
def index(request):
    return render(request, 'travel/main.html')


def login(request):
    return render(request, 'travel/login.html')
