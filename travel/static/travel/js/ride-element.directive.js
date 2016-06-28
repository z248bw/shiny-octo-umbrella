'use strict';

angular.module('travelApp').directive('rideElement', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/travel/templates/ride_element.html',
        scope: {
            ride: '='
        },
        controller: RideElementController,
        controllerAs: 'element'
    };
});