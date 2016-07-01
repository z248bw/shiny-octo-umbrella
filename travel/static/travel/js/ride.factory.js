'use strict'

angular.module('travelServices').factory('Ride', ['$resource', Ride]);

function Ride($resource) {
    return $resource('/rest/1/rides/:pk/', null, {
        'getPassengers': {method: 'GET', url: '/rest/1/rides/:pk/passengers/', isArray: true},
        'update': {method: 'PUT', url: '/rest/1/rides/:pk/', isArray: false}
    });
}