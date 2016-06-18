'use strict';

angular.module('travelApp')
    .controller('passengerJoinController',PassengerJoinController);

function PassengerJoinController($scope, $mdDialog, Passenger, Travel, ride) {

    $scope.passenger = {
        ride: ride.pk,
        phone: null,
        notify_on_ride_change: false,
        notify_on_ride_delete: false,
        notify_on_passenger_delete: false
    },
    $scope.joinRide = function()
    {
        $mdDialog.hide();
        Passenger.save($scope.passenger, function(passenger) {
            passenger.ride = ride;
            Travel.addPassenger(passenger);
        }, function(error){
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Hiba')
                .textContent(error.data.message)
                .ok('Ertem')
            );
        });
    };
}