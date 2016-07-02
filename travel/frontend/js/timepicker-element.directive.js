'use strict';

angular.module('travelApp').directive('timepickerElement', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/travel/templates/timepicker_element.html',
        scope: {
            datetime: '=',
            id: '='
        },
        controller: TimePickerElementController,
        controllerAs: 'timepicker'
    };
});