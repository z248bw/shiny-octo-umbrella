travelApp.controller('rideDetailsController',
    function ($scope, $routeParams, $mdDialog, Ride, PassengerModel) {

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
        });
        $scope.fetching_passengers_of_ride = false;
    };

    $scope.showPassengerJoin = function(ev, ride_pk) {
        PassengerModel.showPassengerJoin(ev, ride_pk, function(passenger) {
            $scope.passengers.push(passenger);
            $scope.ride.num_of_free_seats--;
        });
    };

    $scope.initRideDetails();
});