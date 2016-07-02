(function () {
    'use strict';

    angular
        .module('TravelApp', ['ngResource', 'ngRoute', 'ngMaterial', 'TravelServices'])
        .config(TravelAppConfig);

    angular.module('TravelServices', ['ngResource']);

    function TravelAppConfig($resourceProvider, $httpProvider, $routeProvider) {
        $resourceProvider.defaults.stripTrailingSlashes = false;
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

         $routeProvider.
          when('/rides/:pk', {
            templateUrl: '/static/travel/templates/ride_details.html',
            controller: 'RideDetailsController'
          }).
          when('/manage/ride/:direction', {
            templateUrl: '/static/travel/templates/manage_ride.html',
            controller: 'ManageRideController'
          }).
          otherwise({
            redirectTo: '/rides',
            templateUrl: '/static/travel/templates/rides.html'
          });
    }
}());
