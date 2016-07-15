(function () {
    'use strict';

    angular.module('TravelApp')
        .controller('ManageRideController', ManageRideController);

    ManageRideController.$inject = [
        '$scope',
        '$rootScope',
        '$location',
        '$routeParams',
        'Dialog',
        'Ride',
        'Passenger',
        'TravelManager',
        'Utils'
    ];

    function ManageRideController(
        $scope, $rootScope, $location, $routeParams, Dialog, Ride, Passenger, TravelManager, Utils) {

        var vm = this;
        vm.driver = null;
        vm.passengers = [];
        vm.showDriverSaveDialog = showDriverSaveDialog;
        vm.showDriverDeleteDialog = showDriverDeleteDialog;
        vm.showPassengerDeleteDialog = showPassengerDeleteDialog;
        vm.isDriverExists = isDriverExists;


        $scope.$on('DATETIME_CHANGED', function(event, timepicker) {
            vm.driver.model.start_time = timepicker.datetime;
        });
        $rootScope.$on('DRIVER_ADDED', navigateToRides);
        $rootScope.$on('DRIVER_DELETED', navigateToRides);

        var shouldUpdateOnSave = false;

        function navigateToRides() {
            $location.url('/rides');
        }

        var activate = function() {
            vm.driver = getDriver();
            fetchPassengers();
            initSave();
        };

        function getDriver() {
            if (!('direction' in $routeParams))
            {
                throw new Error('Direction not specified');
            }

            return getDriverByDirection($routeParams.direction);
        }

        function getDriverByDirection(direction) {
            var driver;
            if (direction === 'there')
            {
                driver = TravelManager.getDriverThere();
            }
            else
            {
                driver = TravelManager.getDriverBack();
            }
            return initDriverDirection(driver, direction);
        }

        function initDriverDirection(driver, direction) {
            if (driver.model === null)
            {
                driver.model = {is_return: direction === 'there' ? false : true};
            }
            return driver;
        }

        function fetchPassengers() {
            if (!isDriverExists())
            {
                return;
            }

            Ride.getPassengers({pk: vm.driver.model.pk}, function(response) {
                vm.passengers = response;
            });
        }

        function isDriverExists() {
            return (vm.driver.model.pk !== null && ('pk' in vm.driver.model));
        }

        function initSave() {
            if (isDriverExists())
            {
                shouldUpdateOnSave = true;
            }
        }

        function showDriverSaveDialog(event) {
            if (shouldUpdateOnSave)
            {
                Dialog.showConfirm(
                    event,
                    'Biztos vagy benne, hogy frissiteni akarod a jarmu tulajdonsagait?',
                    updateDriver);
            }
            else
            {
                Dialog.showConfirm(
                    event,
                    'Biztos vagy benne, hogy letre akarod hozni a jarmuvet?',
                    createDriver);
            }
        }

        function updateDriver() {
           vm.driver.modify();
        }

        function createDriver() {
            vm.driver.add();
        }

        function showDriverDeleteDialog(event) {
            Dialog.showConfirm(
                event,
                'Biztos vagy benne, hogy torolni akarod a jarmuvet?',
                deleteDriver);
        }

        function deleteDriver() {
            vm.driver.remove();
        }

        function showPassengerDeleteDialog(event) {
            Dialog.showConfirm(
                event,
                'Biztos vagy benne, hogy torolni szeretned ezt az utast?',
                removeSelectedPassengers
            );
        }

        function removeSelectedPassengers() {
            var selectedPassengers = getSelectedPassengers();
            for (var i = 0; i < selectedPassengers.length; i++)
            {
                var passenger = selectedPassengers[i];
                Utils.removeElementFromArray(passenger, vm.passengers);
                Passenger.remove({pk: passenger.pk});
            }
        }

        function getSelectedPassengers() {
            var selectedPassengers = [];
            for(var i = 0; i < vm.passengers.length; i++)
            {
                if(vm.passengers[i].selected)
                {
                    selectedPassengers.push(vm.passengers[i]);
                }
            }
            return selectedPassengers;
        }

        activate();
    }
}());