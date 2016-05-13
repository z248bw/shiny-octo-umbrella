travelApp.controller('ridesController',
    function ($scope, Ride, Passenger, PassengerModel) {

    $scope.listRides = function() {
        Ride.query(function(response) {
            console.log(response);
            $scope.rides = response;
        });
    };

    $scope.showPassengerJoin = function(ev, ride_pk) {
        PassengerModel.showPassengerJoin(ev, ride_pk);
    };

    $scope.listRides();

});
