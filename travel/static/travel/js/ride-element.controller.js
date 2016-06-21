'use strict';

angular.module('travelApp')
    .controller('rideElementController', RideElementController);

function RideElementController($rootScope, $scope, Travel) {

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
            return Travel.back;
        }
        return Travel.there;
    };

    var configureIsJoinable = function() {
        vm.isJoinable = getCurrentTravel().isEmpty();
    };

    action();

}