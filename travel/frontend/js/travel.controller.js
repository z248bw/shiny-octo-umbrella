(function () {
    'use strict';

    angular.module('TravelApp')
        .controller('TravelController', TravelController);

    TravelController.$inject = ['$location', 'TravelManager', 'UserProfile'];

    function TravelController($location, TravelManager, UserProfile) {

        var vm = this;
        vm.me = null;
        vm.there = TravelManager.getTravelThere();
        vm.back = TravelManager.getTravelBack();
        vm.showManageUserProfile = showManageUserProfile;

        var action = function() {
            vm.me = UserProfile.getUserProfile();
            vm.me.$promise.then(initTravels);
        };

//        TODO: does it really belong here?
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

        function showManageUserProfile() {
            $location.url('/manage/userprofile');
        }

        action();
    }
}());