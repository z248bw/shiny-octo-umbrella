var travelApp = angular.module('travelApp', ['ngResource', 'travelServices']); //'ngResource', 'travelServices'

travelApp.config(function($resourceProvider, $httpProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});

travelApp.controller('travelController', function ($scope, Ride, Passenger) {
    $scope.hello = 'hey';

    $scope.hey = function(){console.log('hey');};

    $scope.rides = [1,2,3];

    $scope.listRides = function() {
        console.log('list rides called');
        Ride.query(function(response) {
            console.log(response);
            $scope.rides = response;
        });
    };

});

//
// Ride.get({pk: pk}, function(response){
//    console.log(response);
//    $scope.rides = response;
// });

