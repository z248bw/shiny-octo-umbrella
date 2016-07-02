(function () {
    'use strict';

    angular.module('travelServices').factory('TravelUser', TravelUser);

    TravelUser.$inject = ['$resource'];

    function TravelUser($resource) {
        return $resource('/rest/1/travel_users/:pk', null, {
            'getMe': {method: 'GET', url: '/rest/1/travel_users/me/', isArray: false}
        });
    }
}());