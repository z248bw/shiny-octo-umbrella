angular.module('travelApp').directive('rideElement', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/travel/templates/ride_element.html',
        scope: {
            ride: '='
        }
    };
});

angular.module('travelApp').directive('travelElement', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/travel/templates/travel_element.html',
        scope: {
            travel: '=',
        },
        controller: TravelElementController,
        controllerAs: 'element'
    };
});