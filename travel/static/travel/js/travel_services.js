var travelServices = angular.module('travelServices', ['ngResource']);

travelServices.factory('Ride', ['$resource', function($resource){
    return $resource('/rest/1/rides/:pk', null, {
        'getPassengers': {method: 'GET', url: '/rest/1/rides/:pk/passengers', isArray: true}
    });
}]);

travelServices.factory('Passenger', ['$resource', function($resource){
    return $resource('/rest/1/passengers/:pk');
}]);