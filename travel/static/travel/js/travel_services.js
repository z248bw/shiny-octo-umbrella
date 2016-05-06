var travelServices = angular.module('travelServices', ['ngResource']);

travelServices.factory('Ride', ['$resource', function($resource){
    return $resource('/rest/1/rides/:pk', null, {
        'passengers': {method: 'GET'}
    });
}]);

travelServices.factory('Passenger', ['$resource', function($resource){
    return $resource('/rest/1/passengers/:pk');
}]);