'use strict';

angular.module('travelApp')
    .controller('rideDetailsController', RidesDetailController);

function RidesDetailController($routeParams, Ride, Travel) {

    var vm = this;
    vm.ride = null;
    vm.passengers = [];
    vm.showPassengerJoin = showPassengerJoin;

    var activate = function() {
        initRideDetails();
    };

    var initRideDetails = function()
    {
        if (!('pk' in $routeParams))
        {
            return;
        }
        var pk = $routeParams.pk;
        getRide(pk);
        listPassengersOfRide(pk);
    };

    var getRide = function(pk) {
        Ride.get({pk: pk}, function(response) {
            vm.ride = response;
            vm.shouldUpdateOnSave = true;
        });
    };

    var listPassengersOfRide = function(pk) {
        Ride.getPassengers({pk: pk}, function(response) {
            vm.passengers = response;
        });
    };

    var showPassengerJoin = function(ev) {
        Travel.showPassengerJoin(ev, vm.ride.pk, function(passenger) {
            vm.passengers.push(passenger);
            vm.ride.num_of_free_seats--;
        });
    };

    activate();
}