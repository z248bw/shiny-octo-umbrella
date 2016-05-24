angular.module('travelApp')
    .controller('ridesController', RidesController);

function RidesController($scope, Ride, Passenger, PassengerModel) {

    var vm = this;

    var rides = [];

    $scope.listRides = function() {
        Ride.query(function(response) {
            rides = response;
            $scope.rides_there = getRidesThere();
            $scope.rides_back = getRidesBack();
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

    $scope.showPassengerJoin = function(ev, ride_pk) {
        PassengerModel.showPassengerJoin(ev, ride_pk, function(passenger) {
            addPassengerToCurrentPassengers(passenger);
        });
    };

    var getRideByPk = function(ride_pk) {
        for (var i = 0; i < rides.length; i++) {
            if (rides[i].pk == ride_pk) {
                return rides[i];
            }
        }
    };

    var addPassengerToCurrentPassengers = function(passenger) {
        $scope.$parent.addPassenger(passenger);
        var ride = getRideByPk(passenger.ride);
        ride.num_of_free_seats--;
    };

    $scope.listRides();

}