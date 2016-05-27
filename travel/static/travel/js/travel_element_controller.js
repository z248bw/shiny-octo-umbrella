angular.module('travelApp')
    .controller('travelElementController', TravelElementController);

function TravelElementController($scope) {

    var vm = this;
    vm.object = null;
    vm.ride = null;

    var action = function() {
        vm.object = getObject();
        vm.ride = getRide();
    };

    var getObject = function () {
        if ($scope.travel.isDriving())
        {
            return $scope.travel.driver;
        }
        else
        {
            return $scope.travel.passenger;
        }
    };

    var getRide = function() {
        if ($scope.travel.isDriving())
        {
            return $scope.travel.driver.model;
        }
        else
        {
            return $scope.travel.passenger.model.ride;
        }
    };

    action();
}