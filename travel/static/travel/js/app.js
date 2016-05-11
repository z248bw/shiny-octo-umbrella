var travelApp = angular.module('travelApp', ['ngResource', 'ngRoute', 'ngMaterial', 'travelServices']);

travelApp.config(function($resourceProvider, $httpProvider, $routeProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

     $routeProvider.
      when('/rides/:pk', {
        templateUrl: '/static/travel/templates/ride_details.html',
        controller: 'rideDetailsController'
      }).
      otherwise({
        redirectTo: '/rides',
        templateUrl: '/static/travel/templates/rides.html'
      });
});
