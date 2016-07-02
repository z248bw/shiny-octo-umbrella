'use strict';

describe('Given a RideElementController', function() {

    beforeEach(module('TravelApp'));
    beforeEach(module('TravelServices'));
    beforeEach(module('TestUtils'));

    var $controller,
        $rootScope,
        $httpBackend,
        TravelManager,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $controller = $injector.get('$controller');
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            TravelManager = $injector.get('TravelManager');
            TestUtils = $injector.get('TestUtils');
        });
    });

    it('on init ride will be set',
        function() {
            var ctrl = $controller('RideElementController', {$scope: {ride: TestUtils.createRideThere('1')}});

            expect(ctrl.ride.pk).toBe('1');
        }
    );

    it('if there is no travel in the current rides direction then joinable will be true',
        function() {
            var ctrl = $controller('RideElementController', {$scope: {ride: TestUtils.createRideThere('1')}});

            expect(ctrl.isJoinable).toBe(true);
        }
    );

    it('if there is a travel in the other rides direction then joinable will be true',
        function() {
            TravelManager.addDriver(TestUtils.createRideBack('2'));

            var ctrl = $controller('RideElementController', {$scope: {ride: TestUtils.createRideThere('1')}});

            expect(ctrl.isJoinable).toBe(true);
        }
    );

    it('if the number of free seats is zero then then joinable will be false',
        function() {
            var ride = TestUtils.createRideThere('1');
            ride.num_of_free_seats = 0;
            var ctrl = $controller('RideElementController', {$scope: {ride: ride}});

            expect(ctrl.isJoinable).toBe(false);
        }
    );

    it('if there is a travel in the current rides direction then joinable will be false',
        function() {
            TravelManager.addDriver(TestUtils.createRideThere('2'));

            var ctrl = $controller('RideElementController', {$scope: {ride: TestUtils.createRideThere('1')}});

            expect(ctrl.isJoinable).toBe(false);
        }
    );

    it('if a passenger is added in the current rides direction then joinable will be false',
        function() {
            var ctrl = $controller('RideElementController', {$scope: {ride: TestUtils.createRideThere('1')}});
            TestUtils.addPassengerThere('1');

            expect(ctrl.isJoinable).toBe(false);
        }
    );

    it('if a passenger is removed in the current rides direction then joinable will be true',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));

            var ctrl = $controller('RideElementController', {$scope: {ride: TestUtils.createRideThere('1')}});
            TestUtils.removePassengerThere();

            expect(ctrl.isJoinable).toBe(true);
        }
    );

    it('if a driver is added in the current rides direction then joinable will be false',
        function() {
            var ctrl = $controller('RideElementController', {$scope: {ride: TestUtils.createRideThere('1')}});
            TestUtils.addDriverThere('1');

            expect(ctrl.isJoinable).toBe(false);
        }
    );

    it('if a driver is removed in the current rides direction then joinable will be true',
        function() {
            TravelManager.addDriver(TestUtils.createRideThere('1'));

            var ctrl = $controller('RideElementController', {$scope: {ride: TestUtils.createRideThere('1')}});
            TestUtils.removeDriverThere();

            expect(ctrl.isJoinable).toBe(true);
        }
    );

});