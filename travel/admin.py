from django.contrib import admin

from travel.models import Passenger, Ride, TravelUser


class TravelUserAdmin(admin.ModelAdmin):
    list_display = ('pk', 'get_user_name', 'get_user_last_name')
    search_fields = ['user__name', 'user__first_name', 'user_last_name']

    def get_user_name(self, obj):
        return obj.user.username

    get_user_name.short_description = 'Username'

    def get_user_last_name(self, obj):
        return obj.user.last_name

    get_user_last_name.short_description = 'Last name'


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
admin.site.register(TravelUser, TravelUserAdmin)
