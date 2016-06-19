'use strict';

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
        $rootScope.$on('DRIVER_DELETED', onDriverDeleted);
    };

    var onPassengerAdded = function () {
        action();
    };

    var onPassengerDeleted = function (event, passenger) {
        onModelDeleted(passenger);
    };

    var onModelDeleted = function(model) {
        if (vm.object.model === null)
        {
            return;
        }
        if (isTheSameModel(vm.object.model, model))
        {
            removeModel();
        }
    };

    var isTheSameModel = function (p1, p2) {
        return p1.pk === p2.pk;
    };

    var removeModel = function() {
        vm.object.model = null;
        vm.ride = null;
    };

    var onDriverDeleted = function(event, driver) {
        onModelDeleted(driver);
    };

    var showElementRemove = function(event) {
        var confirm = null;
        if (getTravellerByDirection($scope.direction).isDriving())
        {
            confirm = getConfirmDialogWithTitle(event,
                'Biztos vagy benne, hogy torolni szeretned a jarmuved?');
        }
        else
        {
            confirm = getConfirmDialogWithTitle(event,
                'Biztos vagy benne, hogy torolni szeretned a magad az utaslistarol?');
        }

        $mdDialog.show(confirm).then(removeElement);
    };

    var getConfirmDialogWithTitle = function(event, title) {
        return $mdDialog.confirm()
            .title(title)
            .targetEvent(event)
            .ok('Igen')
            .cancel('Megse');
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