'use strict';

angular.module('travelApp').directive('travelElement', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/travel/templates/travel_element.html',
        scope: {
            direction: '=',
        },
        controller: TravelElementController,
        controllerAs: 'element'
    };
});