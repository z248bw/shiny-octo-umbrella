from django.contrib.auth.decorators import login_required
from django.shortcuts import render


# @login_required
def index(request):
    return render(request, 'travel/index.html')


# @login_required
def there(request):
    return render(request, 'travel/travel_there.html')


# @login_required
def back(request):
    return render(request, 'travel/travel_back.html')


def login(request):
    return render(request, 'travel/login.html')
