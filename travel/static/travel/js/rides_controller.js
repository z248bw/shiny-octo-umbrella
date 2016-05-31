angular.module('travelApp')
    .controller('ridesController', RidesController);

function RidesController($scope, Ride, Passenger, Travel) {

    var vm = this;
    vm.travel = Travel;
    vm.there = [];
    vm.back = [];
    $scope.showPassengerJoin = function(ev, ride_pk) {
        Travel.showPassengerJoin(ev, ride_pk);
    };

    var activate = function() {
        listRides();
    }

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

//    var onPassengerJoined = function(ride_pk) {
//        $scope.$on('passengerJoined', function(event, args) {
////            console.log('passenger joined ');
////            console.log(args);
//        });
//    };

    var addPassengerToCurrentPassengers = function(passenger) {
        var ride = getRideByPk(passenger.ride);
        ride.num_of_free_seats--;
    };

    var getRideByPk = function(ride_pk) {
        for (var i = 0; i < rides.length; i++) {
            if (rides[i].pk == ride_pk) {
                return rides[i];
            }
        }
    };

    activate();

}