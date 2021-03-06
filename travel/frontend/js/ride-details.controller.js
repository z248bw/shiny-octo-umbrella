(function () {
    'use strict';

    angular.module('TravelApp')
        .controller('RideDetailsController', RidesDetailController);

    RidesDetailController.$inject = ['$routeParams', 'Ride'];

    function RidesDetailController($routeParams, Ride) {

        var vm = this;
        vm.ride = null;
        vm.passengers = [];

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

        activate();
    }
}());