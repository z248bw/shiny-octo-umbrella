'use strict'

angular.module('travelServices').factory('Dialog', ['$mdDialog', Dialog]);

function Dialog($mdDialog) {
    return {
        showPassengerJoin: showPassengerJoin,
        showSuccess: showSuccess,
        showError: showError,
        showConfirm: showConfirm
    };

    function showPassengerJoin(event, passengerModel) {
        $mdDialog.show({
              controller: 'passengerJoinController',
              templateUrl: '/static/travel/templates/passenger_join.html',
              parent: angular.element(document.body),   //TODO do i really need this?
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

    function showSuccess(title) {
         $mdDialog.show(
           $mdDialog.alert()
             .parent(angular.element(document.body))
             .clickOutsideToClose(true)
             .title(title)
             .ok('OK')
         );
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