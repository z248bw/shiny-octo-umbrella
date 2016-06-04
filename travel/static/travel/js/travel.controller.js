angular.module('travelApp')
    .controller('travelController', TravelController);

function TravelController($scope, TravelUser, Travel) {

    var vm = this;
    vm.me = null;
    vm.there = Travel.there;
    vm.back = Travel.back;

    var action = function() {
        TravelUser.getMe(function(response) {
            vm.me = response;
            initTravels();
        });
    };

    var initTravels = function() {
        for (var i = 0; i < vm.me.driven_rides.length; i++)
        {
            var ride = vm.me.driven_rides[i];
            Travel.addDriver(ride);
        }
        for (var i = 0; i < vm.me.passenger_of_rides.length; i++)
        {
            var passenger = vm.me.passenger_of_rides[i];
            Travel.addPassenger(passenger);
        }
    };

    action();
};