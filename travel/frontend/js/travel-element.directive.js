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

    TravelElementController.$inject = ['$rootScope', '$scope', '$mdDialog', 'TravelManager'];

    function TravelElementController($rootScope, $scope, $mdDialog, TravelManager) {

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

        function onPassengerAdded() {
            action();
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

        function showElementRemove(event) {
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
        }

        function getConfirmDialogWithTitle(event, title) {
             return $mdDialog.confirm()
                .title(title)
                .targetEvent(event)
                .ok('Igen')
                .cancel('Megse');
        }

        function removeElement() {
            vm.object.remove();
        }


        function modifyElement(event) {
            vm.object.showModify(event);
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

        function getObject(traveller) {
            if (traveller.isDriving())
            {
                return traveller.driver;
            }
            else
            {
                return traveller.passenger;
            }
        }

        action();
    }
}());