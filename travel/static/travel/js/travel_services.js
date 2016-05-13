var travelServices = angular.module('travelServices', ['ngResource']);

travelServices.factory('Ride', ['$resource', function($resource){
    return $resource('/rest/1/rides/:pk', null, {
        'getPassengers': {method: 'GET', url: '/rest/1/rides/:pk/passengers', isArray: true}
    });
}]);

travelServices.factory('Passenger', ['$resource', function($resource){
    return $resource('/rest/1/passengers/:pk');
}]);

travelServices.factory('PassengerModel', ['$mdDialog', function($mdDialog){
    return {
        passenger: {
            notify_on_ride_change: false,
            notify_on_ride_delete: false,
            notify_on_passenger_delete: false
        },
        showPassengerJoin: function(event, ride_pk){
            this.passenger.ride = ride_pk;
            $mdDialog.show({
                  controller: 'passengerController',
                  templateUrl: '/static/travel/templates/passenger_join.html',
                  parent: angular.element(document.body),
                  targetEvent: event,
                  clickOutsideToClose:true,
                  fullscreen: false
            });
        }
    };
}]);