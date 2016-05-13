travelApp.controller('passengerController',
    function ($scope, $mdDialog, Passenger, PassengerModel) {

    $scope.passenger = PassengerModel.passenger;

    $scope.joinRide = function()
    {
        $mdDialog.hide();
    };

});