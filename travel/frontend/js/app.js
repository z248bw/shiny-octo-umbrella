(function () {
    'use strict';

    angular
        .module('travelApp', ['ngResource', 'ngRoute', 'ngMaterial', 'travelServices'])
        .config(TravelAppConfig);

    angular.module('travelServices', ['ngResource']);

    function TravelAppConfig($resourceProvider, $httpProvider, $routeProvider) {
        $resourceProvider.defaults.stripTrailingSlashes = false;
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

         $routeProvider.
          when('/rides/:pk', {
            templateUrl: '/static/travel/templates/ride_details.html',
            controller: 'rideDetailsController'
          }).
          when('/create/ride/:direction', {     //TODO rename to manage/ride/:direction
            templateUrl: '/static/travel/templates/manage_ride.html',
            controller: 'rideDetailsController'
          }).
          otherwise({
            redirectTo: '/rides',
            templateUrl: '/static/travel/templates/rides.html'
          });
    }
}());
