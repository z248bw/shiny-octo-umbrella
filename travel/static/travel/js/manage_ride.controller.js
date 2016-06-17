'use strict';

angular.module('travelApp')
    .controller('manageRideController', ManageRideController);

function ManageRideController($scope, $routeParams, $mdDialog, Ride, Travel) {

    var vm = this;
    vm.driver = null;
    vm.passengers = [];
    vm.showDriverSaveDialog = null;
    vm.showDriverDeleteDialog = null;
    vm.shouldUpdateOnSave = false;

    $scope.$on('DATETIME_CHANGED', function(event, timepicker) {
        if (vm.driver.model === null)
        {
            vm.driver.model = {};
        }
       vm.driver.model.start_time = timepicker.datetime;
    });

    var activate = function() {
        vm.showDriverSaveDialog = showDriverSaveDialog;
        vm.showDriverDeleteDialog = showDriverDeleteDialog;
        initRideDetails();
    };

    var initRideDetails = function()
    {
        vm.driver = getDriver();
        fetchPassengers();
        initSave();
    };

    var getDriver = function() {
        if (!('direction' in $routeParams))
        {
            throw new Error('Direction not specified');
        }

        return getDriverByDirection($routeParams.direction);
    };

    var getDriverByDirection = function(direction) {
        if (direction === 'there')
        {
            return Travel.there.driver;
        }
        else
        {
            return Travel.back.driver;
        }
    };

    var fetchPassengers = function() {
        if (vm.driver.model === null)
        {
            return;
        }

        Ride.getPassengers({pk: vm.driver.model.pk}, function(response) {
            vm.passengers = response;
        });
    };

    var initSave = function() {
        if (!(vm.driver.model === null))
        {
            vm.shouldUpdateOnSave = true;
        }
    };

    var showDriverSaveDialog = function(event) {
        if (vm.shouldUpdateOnSave)
        {
            var confirm = $mdDialog.confirm()
                .title('Biztos vagy benne, hogy frissiteni akarod a jarmu tulajdonsagait?')
                .targetEvent(event)
                .ok('Igen')
                .cancel('Megse');

            $mdDialog.show(confirm).then(updateDriver);
        }
        else
        {
            var confirm = $mdDialog.confirm()
                .title('Biztos vagy benne, hogy letre akarod hozni a jarmuvet?')
                .targetEvent(event)
                .ok('Igen')
                .cancel('Megse');

            $mdDialog.show(confirm).then(createDriver);
        }
    };

    var updateDriver = function() {
       vm.driver.modify();
    };

    var createDriver = function() {
        vm.driver.add();
    };

    var showDriverDeleteDialog = function(event) {
        var confirm = $mdDialog.confirm()
            .title('Biztos vagy benne, hogy torolni akarod a jarmuvet?')
            .targetEvent(event)
            .ok('Igen')
            .cancel('Megse');

        $mdDialog.show(confirm).then(deleteDriver);
    };

    var deleteDriver = function() {
        vm.driver.remove();
    };

    activate();
}