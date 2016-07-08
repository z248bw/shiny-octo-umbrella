(function () {
    'use strict';

    angular.module('TravelServices').factory('User', User);

    User.$inject = ['$resource'];

    function User($resource) {
        return $resource('/rest/1/users/:pk/', null, {
            'update': {method: 'PUT', url: '/rest/1/users/:pk/', isArray: false},
            'logout': {method: 'POST', url: '/rest/1/users/:pk/logout/', isArray: false},
        });
    }
}());