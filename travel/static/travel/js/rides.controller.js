angular.module('travelApp')
    .controller('ridesController', RidesController);

function RidesController($scope, $rootScope, Ride, Travel) {

    var vm = this;
    vm.travel = Travel;
    vm.there = [];
    vm.back = [];

    var activate = function() {
        listRides();
        $scope.showPassengerJoin = showPassengerJoin;
        $rootScope.$on('PASSENGER_DELETED', onPassengerDeleted);
        $rootScope.$on('PASSENGER_ADDED', onPassengerAdded);
    }

    var showPassengerJoin = function(ev, ride_pk) {
        Travel.showPassengerJoin(ev, ride_pk);
    };

    var onPassengerAdded = function(event, passenger) {
        addPassengerToCurrentPassengers(passenger);
    };

    var addPassengerToCurrentPassengers = function(passenger) {
        var ride = getRideByPk(passenger.ride.pk);
        ride.num_of_free_seats--;
    };

    var getRideByPk = function(ride_pk) {
        for (var i = 0; i < rides.length; i++) {
            if (rides[i].pk == ride_pk) {
                return rides[i];
            }
        }
    };

    var onPassengerDeleted = function(event, passenger) {
        deletePassengerFromCurrentPassengers(passenger);
    };

    var deletePassengerFromCurrentPassengers = function(passenger) {
        var ride = getRideByPk(passenger.ride.pk);
        ride.num_of_free_seats++;
    };

    var rides = [];

    var listRides = function() {
        Ride.query(function(response) {
            rides = response;
            vm.there = getRidesThere();
            vm.back = getRidesBack();
        });
    };

    var getRidesThere = function() {
        return rides.filter(function(ride){
            return !ride.is_return;
        });
    };

    var getRidesBack = function() {
        return rides.filter(function(ride){
            return ride.is_return;
        });
    };

    activate();

}