angular.module('travelApp').directive('rideElement', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/travel/templates/ride_element.html',
        scope: {
            ride: '='
        }
    };
});

angular.module('travelApp').directive('passengerElement', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/travel/templates/passenger_element.html',
        scope: {
            passenger: '='
        }
    };
});