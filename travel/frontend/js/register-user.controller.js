(function () {
    'use strict';

    angular.module('TravelApp')
        .controller('RegisterUserController', RegisterUserController);

    RegisterUserController.$inject = ['$window', 'UserProfile', 'Dialog'];

    function RegisterUserController($window, UserProfile, Dialog) {

        var vm = this;
        vm.travel_user = null;
        vm.showRegisterUserDialog = showRegisterUserDialog;

        function showRegisterUserDialog(event) {
            Dialog.showConfirm(
                event,
                'Biztos vagy benne, hogy regisztralni szeretnel?',
                register);
        }

        function register() {
            var result = UserProfile.register(vm.travel_user);
            result.$promise.then(function(){
                $window.location.href = '/travel/index/';
            });
        }
    }
}());