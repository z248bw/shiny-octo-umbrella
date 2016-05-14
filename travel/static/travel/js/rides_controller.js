travelApp.controller('ridesController',
    function ($scope, Ride, Passenger, PassengerModel) {

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
        PassengerModel.showPassengerJoin(ev, ride_pk);
    };

    $scope.listRides();

});
