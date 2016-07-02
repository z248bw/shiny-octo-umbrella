(function () {
    'use strict';

    angular.module('TravelApp')
        .controller('TravelController', TravelController);

    TravelController.$inject = ['TravelUser', 'TravelManager'];

    function TravelController(TravelUser, TravelManager) {

        var vm = this;
        vm.me = null;
        vm.there = TravelManager.getTravelThere();
        vm.back = TravelManager.getTravelBack();

        var action = function() {
            TravelUser.getMe(onGetMe);
        };


        function onGetMe(me) {
            vm.me = me;
            initTravels();
        }

        function initTravels() {
            var i;
            for (i = 0; i < vm.me.driven_rides.length; i++)
            {
                var ride = vm.me.driven_rides[i];
                TravelManager.addDriver(ride);
            }
            for (i = 0; i < vm.me.passenger_of_rides.length; i++)
            {
                var passenger = vm.me.passenger_of_rides[i];
                TravelManager.addPassenger(passenger);
            }
        }


        action();
    }
}());