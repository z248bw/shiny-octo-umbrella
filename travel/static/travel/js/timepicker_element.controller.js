"use strict";

angular.module('travelApp')
    .controller('timepickerElementController', TimePickerElementController);

function TimePickerElementController($scope) {

    var vm = this;
    $scope.vm = vm;
    vm.time = null;
    vm.date = null;
    vm.getDateTime = null;

    var action = function() {
       initDateTimes();
       vm.getDateTime = getDateTime;
    };

    $scope.$watch('vm.time', function() {
        emitNewDateTime();
    }, true);

    $scope.$watch('vm.date', function() {
        emitNewDateTime();
    }, true);

    var emitNewDateTime = function() {
        $scope.$emit('DATETIME_CHANGED', {id: 1, datetime: vm.getDateTime()});
    };

    var initDateTimes = function() {
        if (!('datetime' in $scope))
        {
            return;
        }
        processInputDateTime($scope.datetime);
    };

    var processInputDateTime = function(datetime) {
        var date = new Date(datetime),
            year = date.getUTCFullYear(),
            month = date.getUTCMonth(),
            day = date.getUTCDate(),
            hour = date.getUTCHours(),
            minute = date.getUTCMinutes();
        vm.date = new Date(year, month, day);
        vm.time = hour + ':' + minute;
    };

    var getDateTime = function() {
        return vm.date.getUTCFullYear()
            + '-'
            + numberToZeroPaddedString(vm.date.getUTCMonth()+1)
            + '-'
            + numberToZeroPaddedString(vm.date.getUTCDate()+1)
            + 'T'
            + vm.time;
    };

    var numberToZeroPaddedString = function(n) {
        if (n < 10)
        {
            return '0' + n.toString();
        }

        return n.toString();
    };

    action();
}