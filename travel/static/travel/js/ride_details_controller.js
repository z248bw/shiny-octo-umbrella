travelApp.controller('rideDetailsController', function ($scope, $routeParams, Ride) {

    $scope.initRideDetails = function()
    {
        var pk = $routeParams.pk;
        $scope.getRide(pk);
        $scope.listPassengersOfRide(pk);
    };

    $scope.getRide = function(pk) {
        Ride.get({pk: pk}, function(response) {
            $scope.ride = response;
        });
    };

    $scope.listPassengersOfRide = function(pk) {
        $scope.fetching_passengers_of_ride = true;
        Ride.getPassengers({pk: pk}, function(response) {
            $scope.passengers = response;
            console.log($scope.passengers);
        });
        $scope.fetching_passengers_of_ride = false;
    }

    $scope.initRideDetails();
});