angular.module('travelApp')
    .controller('passengerJoinController',PassengerJoinController);

function PassengerJoinController($scope, $mdDialog, Passenger, Travel, ride_pk) {

    $scope.passenger = {
        ride: ride_pk,
        phone: null,
        notify_on_ride_change: false,
        notify_on_ride_delete: false,
        notify_on_passenger_delete: false
    },
    $scope.joinRide = function()
    {
        $mdDialog.hide();
        Passenger.save($scope.passenger, function(response) {
            Travel.addPassenger(response);
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