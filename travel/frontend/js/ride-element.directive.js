(function () {
    'use strict';

    angular.module('TravelApp').directive('rideElement', function() {
        return {
            restrict: 'E',
            templateUrl: '/static/travel/templates/ride_element.html',
            scope: {
                ride: '='
            },
            controller: RideElementController,
            controllerAs: 'element'
        };
    });

     angular.module('TravelApp')
        .controller('RideElementController', RideElementController);

    RideElementController.$inject = ['$rootScope', '$scope', 'TravelManager'];

    function RideElementController($rootScope, $scope, TravelManager) {

        var vm = this;
        vm.ride = null;
        vm.isJoinable = false;
        vm.showPassengerJoin = null;

        var action = function() {
            vm.ride = $scope.ride;
            configureIsJoinable();
            vm.showPassengerJoin = showPassengerJoin;
            $rootScope.$on('PASSENGER_ADDED', configureIsJoinable);
            $rootScope.$on('PASSENGER_DELETED', configureIsJoinable);
            $rootScope.$on('DRIVER_ADDED', configureIsJoinable);
            $rootScope.$on('DRIVER_DELETED', configureIsJoinable);
        };

        var showPassengerJoin = function(event) {
            getCurrentTravel().passenger.showAdd(event, vm.ride);
        };

        var getCurrentTravel = function() {
            if(vm.ride.is_return)
            {
                return TravelManager.getTravelBack();
            }
            return TravelManager.getTravelThere();
        };

        var configureIsJoinable = function() {
            vm.isJoinable = getCurrentTravel().isEmpty() && (vm.ride.num_of_free_seats !== 0);
        };

        action();
    }
}());