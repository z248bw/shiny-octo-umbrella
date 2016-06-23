'use strict';

angular.module('travelApp')
    .controller('passengerJoinController',PassengerJoinController);

function PassengerJoinController($scope, $mdDialog, Travel, passengerModel) {

    $scope.passenger = passengerModel;
    $scope.joinRide = function()
    {
        $mdDialog.hide();
         if ($scope.passenger.pk == null)
        {
            savePassenger();
        }
        else
        {
            updatePassenger();
        }
    };

    var savePassenger = function() {
        getPassenger().add($scope.passenger);
    };

    var getPassenger = function() {
        if (passengerModel.ride.is_return)
        {
            return Travel.getPassengerBack();
        }
        else
        {
            return Travel.getPassengerThere();
        }
    };

    var updatePassenger = function() {
        getPassenger().modify($scope.passenger);
    };

}