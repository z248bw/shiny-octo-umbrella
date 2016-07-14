(function () {
    'use strict';

    angular.module('TravelApp')
        .controller('ManageUserProfileController', ManageUserProfileController);

    ManageUserProfileController.$inject = ['$window', 'UserProfile', 'Dialog', 'ProgressManager'];

    function ManageUserProfileController($window, UserProfile, Dialog, ProgressManager) {

        var vm = this;
        vm.travel_user = null;
        vm.showUserProfileUpdateDialog = showUserProfileUpdateDialog;
        vm.showUserProfileDeleteDialog = showUserProfileDeleteDialog;

        function activate() {
            UserProfile.getUserProfile().$promise.then(function(response){
                vm.travel_user = response.travel_user;
            });
        }

        function showUserProfileUpdateDialog(event) {
            Dialog.showConfirm(
                event,
                'Biztos vagy benne, hogy frissiteni akarod a felhasznaloi profilodat?',
                updateUserProfile);
        }

        function updateUserProfile() {
            ProgressManager.decorate({execute:function(){
                var userProfile = UserProfile.update(vm.travel_user);
                userProfile.then(function() {
                    Dialog.showSuccess('Felhasznaloi profile sikeresen frissitve!');
                });
                return userProfile;
            }});
        }

        function showUserProfileDeleteDialog() {
             Dialog.showConfirm(
                event,
                'Biztos vagy benne, hogy torolni akarod felhasznaloi profilodat?',
                removeUserProfile);
        }

        function removeUserProfile() {
            var result = UserProfile.remove();
            result.$promise.then(function(){
                $window.location.href = '/accounts/login';
            });
        }

        activate();
    }
}());