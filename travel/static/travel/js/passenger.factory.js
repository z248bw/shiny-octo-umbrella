'use strict'

angular.module('travelServices').factory('Passenger', ['$resource', Passenger]);

function Passenger($resource) {
    return $resource('/rest/1/passengers/:pk/', null, {
        'update': {method: 'PUT', url: '/rest/1/passengers/:pk/', isArray: false}
    });
}