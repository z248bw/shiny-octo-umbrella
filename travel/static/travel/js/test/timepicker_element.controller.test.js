'use strict';

//"2016-05-31T22:00:00.000Z"
describe('Given a datetimepicker element', function() {

    beforeEach(module('travelApp'));

    it('instantiating the element with datetime as undefined returns null as the current date and time',
        inject(function($controller, $rootScope) {
            var $scope = $rootScope.$new();

            var ctrl = $controller('timepickerElementController', {$scope: $scope});

            expect(ctrl.date).toBe(null);
            expect(ctrl.time).toBe(null);
        })
    );

    it('instantiating the element with a valid datetime sets the date and time',
        inject(function($controller, $rootScope) {
            var $scope = $rootScope.$new();
            $scope.datetime = '2016-05-16T18:39:02.947273Z';
            var ctrl = $controller('timepickerElementController', {$scope: $scope});

            // month is zero based in js Date implementation...
            expect(ctrl.date.getTime()).toBe(new Date(2016, 4, 16).getTime());
            expect(ctrl.time).toBe('18:39');
        })
    );

    it('instantiating the element with a valid datetime will be able to get the datetime string',
        inject(function($controller, $rootScope) {
            var $scope = $rootScope.$new();
            $scope.datetime = '2016-05-16T18:39:02.947273Z';

            var ctrl = $controller('timepickerElementController', {$scope: $scope});

            expect(ctrl.getDateTime()).toBe('2016-05-16T18:39');
        })
    );

    it('when changing the date it should emit the datetime value',
        inject(function($controller, $rootScope) {
            var $scope = $rootScope.$new();
            $scope.id = 1;
            $scope.datetime = '2016-05-16T18:39:02.947273Z';

            var ctrl = $controller('timepickerElementController', {$scope: $scope});

            spyOn($scope, "$emit");
            ctrl.date = new Date(2020, 4, 17);

            $scope.$digest();
            expect($scope.$emit).toHaveBeenCalledWith("DATETIME_CHANGED", {id: 1, datetime: '2020-05-17T18:39'});
        })
    );

    it('when changing the time it should emit the datetime new value',
        inject(function($controller, $rootScope) {
            var $scope = $rootScope.$new();
            $scope.id = 1;
            $scope.datetime = '2016-05-16T18:39:02.947273Z';

            var ctrl = $controller('timepickerElementController', {$scope: $scope});
            $scope.$digest();

            spyOn($scope, "$emit");
            ctrl.time = '20:00';

            $scope.$digest();
            expect($scope.$emit).toHaveBeenCalledWith("DATETIME_CHANGED", {id: 1, datetime: '2016-05-16T20:00'});
        })
    );

});