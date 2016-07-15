(function () {
    'use strict';

    angular.module('TravelApp')
        .controller('RidesController', RidesController);

    RidesController.$inject = ['$scope', '$rootScope', 'Ride', 'TravelManager', 'Utils'];

    function RidesController($scope, $rootScope, Ride, TravelManager, Utils) {

        var vm = this;
        vm.travel = TravelManager;
        vm.there = [];
        vm.back = [];

        var activate = function() {
            listRides();
            $scope.showPassengerJoin = showPassengerJoin;
            $rootScope.$on('PASSENGER_DELETED', onPassengerDeleted);
            $rootScope.$on('PASSENGER_ADDED', onPassengerAdded);
            $rootScope.$on('DRIVER_ADDED', onDriverAdded);
            $rootScope.$on('DRIVER_DELETED', onDriverDeleted);
        };

        function showPassengerJoin(ev, ride) {
            TravelManager.showManagePassengerDialog(ev, ride);
        }

        function onPassengerAdded(event, passenger) {
            addPassengerToCurrentPassengers(passenger);
        }

        function addPassengerToCurrentPassengers(passenger) {
            var ride = getRideByPk(passenger.ride.pk);
            ride.num_of_free_seats--;
        }

        function getRideByPk(ride_pk) {
            for (var i = 0; i < rides.length; i++) {
                if (rides[i].pk == ride_pk) {
                    return rides[i];
                }
            }
        }

        function onPassengerDeleted(event, passenger) {
            deletePassengerFromCurrentPassengers(passenger);
        }

        function deletePassengerFromCurrentPassengers(passenger) {
            var ride = getRideByPk(passenger.ride.pk);
            ride.num_of_free_seats++;
        }


        var rides = [];

        function listRides() {
             Ride.query(function(response) {
                rides = response;
                vm.there = getRidesThere();
                vm.back = getRidesBack();
            });
        }

        function getRidesThere() {
             return rides.filter(function(ride){
                return !ride.is_return;
            });
        }

        function getRidesBack() {
            return rides.filter(function(ride){
                return ride.is_return;
            });
        }

        function onDriverAdded(event, ride) {
            if (ride.is_return)
            {
                vm.back.push(ride);
            }
            else
            {
                vm.there.push(ride);
            }
        }

        function onDriverDeleted(event, ride) {
            if (ride.is_return)
            {
                Utils.removeElementFromArray(ride, vm.back);
            }
            else
            {
                Utils.removeElementFromArray(ride, vm.there);
            }
        }

        activate();

    }
}());