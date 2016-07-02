'use strict';

describe('Given a RideDetailsController', function() {

    beforeEach(module('TravelApp'));
    beforeEach(module('TravelServices'));
    beforeEach(module('TestUtils'));

    var $httpBackend,
        $controller,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $controller = $injector.get('$controller');
            TestUtils = $injector.get('TestUtils');
        });
    });

    it('on init the details of the current ride should be fetched',
        function() {
            var scope = {},
                routeParams = {pk: '1'},
                currentRide = TestUtils.createRideThere('1'),
                passengers = [TestUtils.createPassengerThere('1')];
            $httpBackend.expectGET('/rest/1/rides/1/').respond(currentRide);
            $httpBackend.expectGET('/rest/1/rides/1/passengers/').respond(passengers);

            var ctrl = $controller('RideDetailsController', {$scope: scope, $routeParams: routeParams});
            $httpBackend.flush();

            expect(ctrl.ride.pk).toBe('1');
            expect(ctrl.passengers.length).toBe(1);
        }
    );

});