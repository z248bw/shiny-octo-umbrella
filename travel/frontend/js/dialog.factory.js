(function () {
    'use strict';

    angular.module('TravelServices').factory('Dialog', Dialog);

    Dialog.$inject = ['$mdDialog'];

    function Dialog($mdDialog) {
        return {
            showPassengerJoin: showPassengerJoin,
            showSuccess: showSuccess,
            showError: showError,
            showConfirm: showConfirm
        };

        function showPassengerJoin(event, passengerModel) {
            $mdDialog.show({
                  controller: 'PassengerJoinController',
                  templateUrl: '/static/travel/templates/passenger_join.html',
                  parent: angular.element(document.body),
                  targetEvent: event,
                  locals: {
                    passengerModel: passengerModel,
                  },
                  clickOutsideToClose:true,
                  fullscreen: false
            });
        }

        function showError(error) {
            $mdDialog.show(
               $mdDialog.alert()
                 .parent(angular.element(document.body))
                 .clickOutsideToClose(true)
                 .title('Sikertelen tranzakcio!')
                 .textContent(error)
                 .ok('OK')
             );
        }

        function showSuccess(title, content, callback) {
             $mdDialog.show(
               $mdDialog.alert()
                 .parent(angular.element(document.body))
                 .clickOutsideToClose(true)
                 .title(title)
                 .textContent(content)
                 .ok('OK')
             ).then(callback);
        }

        function showConfirm(event, title, callback) {
            var confirm = $mdDialog.confirm()
            .title(title)
            .targetEvent(event)
            .ok('Igen')
            .cancel('Megse');

            $mdDialog.show(confirm).then(callback);
        }
    }
}());