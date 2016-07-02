(function () {
    'use strict';

    angular.module('TravelApp').directive('timepickerElement', function() {
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

    angular.module('TravelApp')
        .controller('TimepickerElementController', TimePickerElementController);

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

        $scope.$watch('vm.time.hour', emitNewDateTime, true);

        $scope.$watch('vm.time.min', emitNewDateTime, true);

        $scope.$watch('vm.date', emitNewDateTime, true);

        function emitNewDateTime() {
            $scope.$emit('DATETIME_CHANGED', {id: 1, datetime: vm.getDateTime()});
        }

        function initDateTimes() {
            if (!('datetime' in $scope))
            {
                return;
            }
            if ($scope.datetime == null || $scope.datetime === '') // jshint ignore:line
            {
                return;
            }
            processInputDateTime($scope.datetime);
        }

        function processInputDateTime(datetime) {
            var date = new Date(datetime),
                year = date.getUTCFullYear(),
                month = date.getUTCMonth(),
                day = date.getUTCDate(),
                hour = date.getUTCHours(),
                minute = date.getUTCMinutes();
            vm.date = new Date(Date.UTC(year, month, day));
            vm.time.hour = hour;
            vm.time.min = minute;
        }

        function getDateTime() {
            return vm.date.getUTCFullYear() +
                   '-' +
                   numberToZeroPaddedString(vm.date.getUTCMonth()+1) +
                   '-' +
                   numberToZeroPaddedString(vm.date.getUTCDate()) +
                   'T' +
                   vm.time.getTime();
        }

        function numberToZeroPaddedString(n) {
            if (n < 10)
            {
                return '0' + n.toString();
            }

            return n.toString();
        }

        action();
    }
}());