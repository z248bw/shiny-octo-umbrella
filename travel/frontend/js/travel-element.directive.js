(function () {
    'use strict';

    angular.module('TravelApp').directive('travelElement', function() {
        return {
            restrict: 'E',
            templateUrl: '/static/travel/templates/travel_element.html',
            scope: {
                direction: '=',
            },
            controller: TravelElementController,
            controllerAs: 'element'
        };
    });

    angular.module('TravelApp')
        .controller('TravelElementController', TravelElementController);

    TravelElementController.$inject = ['$rootScope', '$scope', 'Dialog', 'TravelManager'];

    function TravelElementController($rootScope, $scope, Dialog, TravelManager) {

        var vm = this;
        vm.object = null;
        vm.ride = null;
        vm.remove = showElementRemove;
        vm.modify = modifyElement;

        $rootScope.$on('PASSENGER_DELETED', onPassengerDeleted);
        $rootScope.$on('PASSENGER_ADDED', action);
        $rootScope.$on('DRIVER_DELETED', onDriverDeleted);
        $rootScope.$on('DRIVER_ADDED', action);
        $rootScope.$on('DRIVER_UPDATED', onDriverUpdated);

        var traveller = null;

        function action() {
            vm.object = getObject();
            vm.ride = vm.object.getRide();
        }

        function getObject() {
            traveller = getTravellerByDirection($scope.direction);
            if (traveller.isDriving())
            {
                return traveller.driver;
            }
            else
            {
                return traveller.passenger;
            }
        }

         function getTravellerByDirection(direction) {
            if (direction === 'there')
            {
                return TravelManager.getTravelThere();
            }
            else if (direction === 'back')
            {
                return TravelManager.getTravelBack();
            }
        }

        function onPassengerDeleted(event, passenger) {
            if(vm.ride === null)
            {
                return;
            }
            if(isTheSameDirection(vm.ride, passenger.ride))
            {
                removeModel();
            }
        }

        function isTheSameDirection(r1, r2) {
            return r1.is_return === r2.is_return;
        }

        function removeModel() {
            vm.object.model = null;
            vm.ride = null;
        }

        function onDriverDeleted(event, driver) {
            if(vm.ride === null)
             {
                return;
             }
            if(isTheSameDirection(vm.ride, driver))
            {
                removeModel();
            }
        }

        function onDriverUpdated(event, driver) {
            if (driver.is_return === vm.ride.is_return && traveller.isDriving())
            {
                vm.ride = driver;
            }
        }

        function showElementRemove(event) {
            var confirm = null;
            var title = '';
            if (getTravellerByDirection($scope.direction).isDriving())
            {
                title = 'Biztos vagy benne, hogy torolni szeretned a jarmuved?';
            }
            else
            {
                title = 'Biztos vagy benne, hogy torolni szeretned a magad az utaslistarol?';
            }
            Dialog.showConfirm(
                event,
                title,
                removeElement
            );
        }

        function removeElement() {
            vm.object.remove();
        }


        function modifyElement(event) {
            vm.object.showModify(event);
        }

        action();
    }
}());