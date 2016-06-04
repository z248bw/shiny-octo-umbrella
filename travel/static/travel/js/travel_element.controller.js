angular.module('travelApp')
    .controller('travelElementController', TravelElementController);

function TravelElementController($rootScope, $scope, Travel) {

    var vm = this;
    vm.object = null;
    vm.ride = null;
    vm.remove = null;
    vm.modify = null;

    var action = function() {
        var traveller = getTravellerByDirection($scope.direction);
        vm.object = getObject(traveller);
        vm.ride = vm.object.getRide();
        vm.remove = removeElement;
        vm.modify = modifyElement;
        $rootScope.$on('PASSENGER_DELETED', onPassengerDeleted);
        $rootScope.$on('PASSENGER_ADDED', onPassengerAdded);
    };

    var onPassengerAdded = function () {
        action();
    };

    var onPassengerDeleted = function (event, passenger) {
        if (isTheSamePassenger(vm.object.model, passenger))
        {
            vm.object.model = null;
            vm.ride = null;
        }
    };

    var isTheSamePassenger = function (p1, p2) {
        return p1.pk === p2.pk;
    };

    var removeElement = function() {
        vm.object.remove();
    };

    var modifyElement = function() {
        //TODO
    };

    var getTravellerByDirection = function(direction) {
        if (direction === 'there')
        {
            return Travel.there;
        }
        else if (direction === 'back')
        {
            return Travel.back
        }
    }

    var getObject = function(traveller) {
        if (traveller.isDriving())
        {
            return traveller.driver;
        }
        else
        {
            return traveller.passenger;
        }
    };

    action();
}