'use strict';

describe('Given a TravelManager element', function() {

    var mockRide = {
        remove: function(pk, callback) {
            callback();
        }
    };

    beforeEach(module("TravelServices", function ($provide) {
        $provide.value("Ride", mockRide);
    }));

    beforeEach(module('TravelApp'));
    beforeEach(module('TestUtils'));

    var $controller,
        $httpBackend,
        TravelManager,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $controller = $injector.get('$controller');
            $httpBackend = $injector.get('$httpBackend');
            TestUtils = $injector.get('TestUtils');
            TravelManager = $injector.get('TravelManager');
        });
    });


    it('travelElementController instantiated as "there" will set the object to null when TravelManager.there is null',
        function() {
            var scope = {direction: 'there'};

            var ctrl = $controller('TravelElementController', {$scope: scope});

            expect(ctrl.object.model).toBe(null);
        }
    );

    it('travelElementController instantiated as "there" will set the object to TravelManager.there',
        function() {
            var scope = {direction: 'there'};
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));

            var ctrl = $controller('TravelElementController', {$scope: scope});

            expect(ctrl.object.model.ride.num_of_free_seats).toBe(1);
        }
    );

    it('travelElementController instantiated as "there" will set the ride object',
        function() {
            var scope = {direction: 'there'};
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));

            var ctrl = $controller('TravelElementController', {$scope: scope});

            expect(ctrl.ride.pk).toBe('1');
        }
    );

    it('travelElementController instantiated as "back" will set the object to TravelManager.back',
        function() {
            var scope = {direction: 'back'};
            TravelManager.addPassenger(TestUtils.createPassengerBack('1'));

            var ctrl = $controller('TravelElementController', {$scope: scope});

            expect(ctrl.object.model.pk).toBe('1');
        }
    );

     it('travelElementController will not set the object and ride if the direction of the new passenger is not the same',
        function() {
            var scope = {direction: 'there'};
            TravelManager.addPassenger(TestUtils.createPassengerBack('1'));

            var ctrl = $controller('TravelElementController', {$scope: scope});

            expect(ctrl.object.model).toBe(null);
            expect(ctrl.ride).toBe(null);
        }
    );

    it('travelElementController will set the object.model to null if the passenger is deleted',
        function() {
            var scope = {direction: 'there'};
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));

            var ctrl = $controller('TravelElementController', {$scope: scope});
            TestUtils.removePassengerThere();

            expect(ctrl.object.model).toBe(null);
        }
    );

    it('travelElementController will set the object.model to null if the driver is deleted',
        function() {
            var scope = {direction: 'there'};
            TravelManager.addDriver(TestUtils.createRideThere('1'));

            var ctrl = $controller('TravelElementController', {$scope: scope});
            TravelManager.getDriverThere().remove();

            expect(ctrl.object.model).toBe(null);
        }
    );

    it('travelElementController can remove the element',
        inject(function($rootScope) {
            var $scope = $rootScope.$new();
            $scope.direction = 'there';
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));
            var deferred = TestUtils.getMdDialogShowResponseDeferred();

            var ctrl = $controller('TravelElementController', {$scope: $scope});
            ctrl.remove();

           $httpBackend.expectDELETE('/rest/1/passengers/1/').respond({});
           TestUtils.resolveDeferred($scope, deferred);
           $httpBackend.flush();

            expect(ctrl.object.model).toBe(null);
        })
    );

    it('travelElementController will do nothing if another passenger is deleted',
        function() {
            var scope = {direction: 'back'};
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));
            TravelManager.addPassenger(TestUtils.createPassengerBack('2'));

            var ctrl = $controller('TravelElementController', {$scope: scope});
            TestUtils.removePassengerThere();

            expect(ctrl.object.model.pk).toBe('2');
        }
    );

    it('travelElementController will set the ride to null if the passenger is deleted',
        function() {
            var scope = {direction: 'there'};
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));

            var ctrl = $controller('TravelElementController', {$scope: scope});
            TestUtils.removePassengerThere();

            expect(ctrl.ride).toBe(null);
        }
    );

    it('travelElementController will set the object and ride if a new passenger is added',
        function() {
            var scope = {direction: 'there'};
            var passenger = TestUtils.createPassengerThere('1');

            var ctrl = $controller('TravelElementController', {$scope: scope});
            TestUtils.addPassengerThere('1');

            expect(ctrl.object.model.pk).toBe('1');
            expect(ctrl.ride.pk).toBe('1');
        }
    );

    it('travelElementController will not set the object and ride if the direction of the new passenger does not match',
        function() {
            var scope = {direction: 'there'};
            var passenger = TestUtils.createPassengerBack('1');

            var ctrl = $controller('TravelElementController', {$scope: scope});
            TravelManager.addPassenger(passenger);

            expect(ctrl.object.model).toBe(null);
            expect(ctrl.ride).toBe(null);
        }
    );

});