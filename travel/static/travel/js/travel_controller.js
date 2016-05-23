travelApp.controller('travelController',
    function ($scope, TravelUser, Passenger) {

    $scope.driver_there = null;
    $scope.driver_back = null;
    $scope.passenger_there = null;
    $scope.passenger_back = null;

    TravelUser.getMe(function(response) {
        $scope.me = response;
        initMyRides();
    });

    var initMyRides = function() {
        for (var i = 0; i < $scope.me.driven_rides.length; i++)
        {
            var ride = $scope.me.driven_rides[i];
            $scope.addDriver(ride);
        }
        for (var i = 0; i < $scope.me.passenger_of_rides.length; i++)
        {
            var passenger = $scope.me.passenger_of_rides[i];
            $scope.addPassenger(passenger);
        }
    };

    $scope.addPassenger = function(passenger)
    {
        if (passenger.is_return)
        {
            $scope.passenger_back = passenger;
        }
        else
        {
            $scope.passenger_there = passenger;
        }
    };

    $scope.addDriver = function(ride)
    {
        if (ride.is_return)
        {
            $scope.driver_back = ride;
        }
        else
        {
            $scope.driver_there = ride;
        }
    };

     $scope.deletePassenger = function(passenger) {
        Passenger.remove({pk: passenger.pk}, function(response) {
            passenger = null;
        })
    };

//    $scope.deletePassengerThere = function() {
//        Passenger.remove({pk: $scope.passenger_there.pk}, function(response) {
//            $scope.passenger_there = null;
//        })
//    };
//
//    $scope.deletePassengerBack = function() {
//        Passenger.remove({pk: $scope.passenger_back.pk}, function(response) {
//            $scope.passenger_back = null;
//        })
//    };

});