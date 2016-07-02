"use strict";

angular.module('travelApp')
    .controller('timepickerElementController', TimePickerElementController);

TimePickerElementController.$inject = ['$scope'];

function TimePickerElementController($scope) {

    var vm = this;
    $scope.vm = vm;
    vm.time = {
        hour: '00',
        min: '00',
        getHours: function() {
           var hours = [];
           for (var i = 0; i < 24; i++)
           {
                hours.push(numberToZeroPaddedString(i));
           }
           return hours;
        },
        getMinutes: function() {
           var mins = [];
           for (var i = 0; i < 60; i++)
           {
                mins.push(numberToZeroPaddedString(i));
           }
           return mins;
        },
        getTime: function() {
            return this.hour + ':' + this.min;
        }
    };
    vm.date = new Date();
    vm.getDateTime = null;

    var action = function() {
       initDateTimes();
       vm.getDateTime = getDateTime;
    };

    $scope.$watch('vm.time.hour', function() {
        emitNewDateTime();
    }, true);

    $scope.$watch('vm.time.min', function() {
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
        if ($scope.datetime == null)
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
        vm.date = new Date(Date.UTC(year, month, day));
        vm.time.hour = hour;
        vm.time.min = minute;
    };

    var getDateTime = function() {
        return vm.date.getUTCFullYear()
            + '-'
            + numberToZeroPaddedString(vm.date.getUTCMonth()+1)
            + '-'
            + numberToZeroPaddedString(vm.date.getUTCDate())
            + 'T'
            + vm.time.getTime();
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