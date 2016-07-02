(function () {
    'use strict';

    angular.module('TravelApp')
        .controller('ManageUserProfileController', ManageUserProfileController);

    ManageUserProfileController.$inject = ['UserProfile'];

    function ManageUserProfileController(UserProfile) {

        var vm = this;
        vm.travel_user = null;

        function activate() {
            UserProfile.getUserProfile().$promise.then(function(response){
                vm.travel_user = response.travel_user;
            });
        }

        activate();
    }
}());