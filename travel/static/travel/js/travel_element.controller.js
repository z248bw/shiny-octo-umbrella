angular.module('travelApp')
    .controller('travelElementController', TravelElementController);

function TravelElementController($rootScope, $scope, $mdDialog, Travel) {

    var vm = this;
    vm.object = null;
    vm.ride = null;
    vm.remove = null;
    vm.modify = null;

    var action = function() {
        var traveller = getTravellerByDirection($scope.direction);
        vm.object = getObject(traveller);
        vm.ride = vm.object.getRide();
        vm.remove = showElementRemove;
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

    var showElementRemove = function(event) {
        var confirm = $mdDialog.confirm()
            .title('Biztos vagy benne, hogy torolni szeretned magad az utaslistarol?')
            .targetEvent(event)
            .ok('Igen')
            .cancel('Megse');

        $mdDialog.show(confirm).then(removeElement);
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