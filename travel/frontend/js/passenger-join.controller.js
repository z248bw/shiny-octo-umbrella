(function () {
    'use strict';

    angular.module('travelApp')
        .controller('passengerJoinController',PassengerJoinController);

    PassengerJoinController.$inject = ['$scope', '$mdDialog', 'TravelManager', 'passengerModel'];

    function PassengerJoinController($scope, $mdDialog, TravelManager, passengerModel) {

        $scope.passenger = passengerModel;
        $scope.joinRide = function()
        {
            $mdDialog.hide();
             if ($scope.passenger.pk === null || !('pk' in $scope.passenger))
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
                return TravelManager.getPassengerBack();
            }
            else
            {
                return TravelManager.getPassengerThere();
            }
        };

        var updatePassenger = function() {
            getPassenger().modify($scope.passenger);
        };
    }
}());