'use strict';

//"2016-05-31T22:00:00.000Z"
describe('Given a datetimepicker element', function() {

    beforeEach(module('TravelApp'));

    var $controller,
        $rootScope;

    beforeEach(function(){
        angular.mock.inject(function ($injector) {
            $controller = $injector.get('$controller');
            $rootScope = $injector.get('$rootScope');
        });
    });

    it('instantiating the element with datetime as undefined returns the current datetime as the current date and time',
        function() {
            var $scope = $rootScope.$new();

            var ctrl = $controller('TimepickerElementController', {$scope: $scope});

            expect(ctrl.date.getTime()).not.toBe(new Date('invalid'));
            expect(ctrl.time.hour).toBe('00');
            expect(ctrl.time.min).toBe('00');
        }
    );

    it('instantiating the element with datetime as empty string returns the current datetime as the current date and time',
        function() {
            var $scope = $rootScope.$new();
            $scope.datetime = ''

            var ctrl = $controller('TimepickerElementController', {$scope: $scope});

            expect(ctrl.date.getTime()).not.toBe(new Date('invalid'));
            expect(ctrl.time.hour).toBe('00');
            expect(ctrl.time.min).toBe('00');
        }
    );

    it('instantiating the element with a valid datetime sets the date and time',
        function() {
            var $scope = $rootScope.$new();
            $scope.datetime = '2016-05-16T18:39:02.947273Z';
            var ctrl = $controller('TimepickerElementController', {$scope: $scope});

            // month is zero based in js Date implementation...
            expect(ctrl.date.getTime()).toBe(new Date(Date.UTC(2016, 4, 16)).getTime());
            expect(ctrl.time.getTime()).toBe('18:39');
        }
    );

    it('instantiating the element with a valid datetime will be able to get the datetime string',
        function() {
            var $scope = $rootScope.$new();
            $scope.datetime = '2016-05-16T18:39:02.947273Z';

            var ctrl = $controller('TimepickerElementController', {$scope: $scope});

            expect(ctrl.getDateTime()).toBe('2016-05-16T18:39');
        }
    );

    it('when changing the date it should emit the new datetime value',
        function() {
            var $scope = $rootScope.$new();
            $scope.id = 1;
            $scope.datetime = '2016-05-16T18:39:02.947273Z';

            var ctrl = $controller('TimepickerElementController', {$scope: $scope});

            spyOn($scope, "$emit");
            ctrl.date = new Date(Date.UTC(2020, 4, 17));

            $scope.$digest();
            expect($scope.$emit).toHaveBeenCalledWith("DATETIME_CHANGED", {id: 1, datetime: '2020-05-17T18:39'});
        }
    );

    it('when changing the time it should emit the new datetime value',
        function() {
            var $scope = $rootScope.$new();
            $scope.id = 1;
            $scope.datetime = '2016-05-16T18:39:02.947273Z';

            var ctrl = $controller('TimepickerElementController', {$scope: $scope});
            $scope.$digest();

            spyOn($scope, "$emit");
            ctrl.time.hour = '20';
            ctrl.time.min = '00';

            $scope.$digest();
            expect($scope.$emit).toHaveBeenCalledWith("DATETIME_CHANGED", {id: 1, datetime: '2016-05-16T20:00'});
        }
    );

});