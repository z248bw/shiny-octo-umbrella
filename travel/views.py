from django.contrib.auth.decorators import login_required
from django.shortcuts import render


def index(request):
    return render(request, 'travel/index.html')


def register(request):
    return render(request, 'travel/register.html')


@login_required
def main(request):
    return render(request, 'travel/main.html')


def login(request):
    return render(request, 'travel/login.html')
