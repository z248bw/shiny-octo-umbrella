(function () {
    'use strict';

    angular.module('TravelApp')
        .controller('TravelController', TravelController);

    TravelController.$inject = [
        '$rootScope',
        '$location',
        '$window',
        'TravelManager',
        'UserProfile',
        'App',
        'Dialog',
        'ProgressManager'
    ];

    function TravelController(
        $rootScope, $location, $window, TravelManager, UserProfile, App, Dialog, ProgressManager) {

        var vm = this;
        vm.me = null;
        vm.there = TravelManager.getTravelThere();
        vm.back = TravelManager.getTravelBack();
        vm.showManageUserProfile = showManageUserProfile;
        vm.showAbout = showAbout;
        vm.logout = logout;
        vm.isLoggedIn = isLoggedIn;
        vm.isPageLoading = isPageLoading;

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

        function showAbout() {
            App.about(function(response){
                Dialog.showSuccess(
                    'Nevjegy',
                    'Verzio: ' + response.version + ' ' +
                    'Github: majd lesz'
                );
            });
        }

        function logout() {
            UserProfile.logout().$promise.then(function() {
                $window.location.href = '/accounts/login/';
            });
        }

        function isLoggedIn() {
            return UserProfile.isLoggedIn();
        }

        function onRouteChangeStart(event, toState, toParams, fromState, fromParams) {
            vm.isPageLoading = true;
        }

        function onRouteChangeSuccess(event, toState, toParams, fromState, fromParams) {
            vm.isPageLoading = false;
        }

        function isPageLoading() {
            return ProgressManager.isLoading();
        }

        action();
    }
}());