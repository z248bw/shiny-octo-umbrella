(function () {
    'use strict';

    angular.module('TravelServices').factory('Passenger', Passenger);

    Passenger.$inject = ['$resource'];

    function Passenger($resource) {
        return $resource('/rest/1/passengers/:pk/', null, {
            'update': {method: 'PUT', url: '/rest/1/passengers/:pk/', isArray: false}
        });
    }
}());