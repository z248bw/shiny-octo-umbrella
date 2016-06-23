'use strict';

angular.module('travelApp')
    .controller('manageRideController', ManageRideController);

function ManageRideController($scope, $rootScope, $location, $routeParams, $mdDialog, Ride, Travel) {

    var vm = this;
    vm.driver = null;
    vm.passengers = [];
    vm.showDriverSaveDialog = null;
    vm.showDriverDeleteDialog = null;
    vm.shouldUpdateOnSave = false;

    $scope.$on('DATETIME_CHANGED', function(event, timepicker) {
        vm.driver.model.start_time = timepicker.datetime;
    });

    $rootScope.$on('DRIVER_ADDED', function(event, driver) {
        $location.url('/rides');
    });

//    TODO driver delete?

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
        var driver;
        if (direction === 'there')
        {
            driver = Travel.getDriverThere();
        }
        else
        {
            driver = Travel.getDriverBack();
        }
        return initDriverDirection(driver, direction)
    };

    var initDriverDirection = function(driver, direction) {
        if (driver.model == null)
        {
            driver.model = {is_return: direction === 'there' ? false : true};
        }
        return driver;
    };

    var fetchPassengers = function() {
        if (!isExistingDriver(vm.driver.model))
        {
            return;
        }

        Ride.getPassengers({pk: vm.driver.model.pk}, function(response) {
            vm.passengers = response;
        });
    };

    var isExistingDriver = function(driver) {
        return driver.pk != null;
    };

    var initSave = function() {
        if (isExistingDriver(vm.driver.model))
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