from django.contrib import admin

from travel.models import Passenger, Ride


class PassengerInline(admin.TabularInline):
    model = Passenger
    fk_name = 'ride'
    extra = 5


class CarAdmin(admin.ModelAdmin):
    list_display = ('pk', 'driver', 'car_name', 'price', 'get_num_of_free_seats', 'start_time', 'start_location')
    list_filter = ['num_of_seats']
    search_fields = ['driver']
    inlines = [PassengerInline]


admin.site.register(Ride, CarAdmin)
