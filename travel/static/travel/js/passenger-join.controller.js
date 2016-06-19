'use strict';

angular.module('travelApp')
    .controller('passengerJoinController',PassengerJoinController);

function PassengerJoinController($scope, $mdDialog, Travel, passengerModel) {

    $scope.passenger = passengerModel;
    $scope.joinRide = function()
    {
        $mdDialog.hide();
        if (passengerModel.ride.is_return)
        {
            Travel.back.passenger.add(passengerModel);
        }
        else
        {
            Travel.there.passenger.add(passengerModel);
        }
    };

}