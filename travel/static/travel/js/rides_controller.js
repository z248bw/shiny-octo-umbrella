travelApp.controller('ridesController', function ($scope, Ride, Passenger) {

    $scope.listRides = function() {
        Ride.query(function(response) {
            console.log(response);
            $scope.rides = response;
        });
    };

    $scope.listRides();

});
