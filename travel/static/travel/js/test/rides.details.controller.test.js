'use strict';

describe('Given a RideDetailsController', function() {

    beforeEach(module('travelApp'));
    beforeEach(module('travelServices'));
    beforeEach(module('testUtils'));

    var $httpBackend,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            TestUtils = $injector.get('TestUtils');
        });
    });

    it('on init the details of the current ride should be fetched',
        inject(function($controller) {
            var scope = {},
                routeParams = {pk: '1'},
                currentRide = TestUtils.createRideThere('1'),
                passengers = [TestUtils.createPassengerThere('1')];
            $httpBackend.expectGET('/rest/1/rides/1').respond(currentRide);
            $httpBackend.expectGET('/rest/1/rides/1/passengers/').respond(passengers);

            var ctrl = $controller('rideDetailsController', {$scope: scope, $routeParams: routeParams});
            $httpBackend.flush();

            expect(ctrl.ride.pk).toBe('1');
            expect(ctrl.passengers.length).toBe(1);
        })
    );

});