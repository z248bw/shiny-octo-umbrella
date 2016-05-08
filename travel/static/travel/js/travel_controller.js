var travelApp = angular.module('travelApp', ['ngResource', 'ngMaterial', 'travelServices']); //'ngResource', 'travelServices'

travelApp.config(function($resourceProvider, $httpProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});

travelApp.controller('travelController', function ($scope, Ride, Passenger) {
    $scope.hello = 'hey';

    $scope.hey = function(){console.log('hey');};

    $scope.listRides = function() {
        console.log('list rides called');
        Ride.query(function(response) {
            console.log(response);
            $scope.rides = response;
        });
    };

    console.log('travelcontroller called');
    $scope.listRides();

});
