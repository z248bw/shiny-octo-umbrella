angular.module('travelApp')
    .controller('passengerController',PassengerController);

function PassengerController($scope, $mdDialog, Passenger, PassengerModel) {

    $scope.passenger = PassengerModel.passenger;

    $scope.joinRide = function()
    {
        $mdDialog.hide();
        Passenger.save($scope.passenger, function(response){
            PassengerModel.passenger = response;
            PassengerModel.success_callback(response);
        }, function(error){
            console.log(error);
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