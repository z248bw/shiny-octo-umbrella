(function () {
    'use strict';

    angular.module('TravelApp')
        .controller('ManageUserProfileController', ManageUserProfileController);

    ManageUserProfileController.$inject = ['UserProfile', 'Dialog'];

    function ManageUserProfileController(UserProfile, Dialog) {

        var vm = this;
        vm.travel_user = null;
        vm.showUserProfileSaveDialog = showUserProfileSaveDialog;

        function activate() {
            UserProfile.getUserProfile().$promise.then(function(response){
                vm.travel_user = response.travel_user;
            });
        }

        function showUserProfileSaveDialog(event) {
            Dialog.showConfirm(
                event,
                'Biztos vagy benne, hogy frissiteni akarod a felhasznaloi profilodat?',
                saveUserProfile);
        }

        function saveUserProfile() {
            var userProfile = UserProfile.save(vm.travel_user);
            userProfile.then(function() {
                Dialog.showSuccess('Felhasznaloi profile sikeresen frissitve!');
            });
        }

        activate();
    }
}());