(function () {
    'use strict';

    angular.module('TravelServices').factory('App', App);

    App.$inject = ['$resource'];

    function App($resource) {
        return $resource('/rest/1/app/', null, {
            'about': {method: 'GET', url: '/rest/1/app/about/', isArray: false}
        });
    }
}());