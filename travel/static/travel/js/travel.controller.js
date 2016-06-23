'use strict';

angular.module('travelApp')
    .controller('travelController', TravelController);

function TravelController(TravelUser, TravelManager) {

    var vm = this;
    vm.me = null;
    vm.there = TravelManager.getTravelThere();
    vm.back = TravelManager.getTravelBack();

    var action = function() {
        TravelUser.getMe(onGetMe);
    };

    var onGetMe = function(me){
        vm.me = me;
        initTravels();
    }

    var initTravels = function() {
        for (var i = 0; i < vm.me.driven_rides.length; i++)
        {
            var ride = vm.me.driven_rides[i];
            TravelManager.addDriver(ride);
        }
        for (var i = 0; i < vm.me.passenger_of_rides.length; i++)
        {
            var passenger = vm.me.passenger_of_rides[i];
            TravelManager.addPassenger(passenger);
        }
    };

    action();
};