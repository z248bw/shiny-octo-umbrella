(function () {
    'use strict';

    angular
        .module('TravelApp', ['ngResource', 'ngRoute', 'ngMaterial', 'TravelServices'])
        .config(TravelAppConfig);

    angular.module('TravelServices', ['ngResource']);

    function TravelAppConfig($resourceProvider, $mdThemingProvider, $httpProvider, $routeProvider) {
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
            controller: 'RideDetailsController'
          }).
          when('/manage/userprofile', {
            templateUrl: '/static/travel/templates/manage_userprofile.html',
            controller: 'ManageUserProfileController',
            controllerAs: 'vm'
          }).
          when('/login', {
            templateUrl: '/static/travel/templates/login.html',
          }).
          otherwise({
            redirectTo: '/rides',
            templateUrl: '/static/travel/templates/rides.html'
          });

        $mdThemingProvider.theme('default')
            .primaryPalette('indigo', {
                'default': '400', // by default use shade 400 from the pink palette for primary intentions
                'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
                'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
                'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
            });
    }
}());
