'use strict';

describe('Given a Travel element', function() {

    var mockPassenger = {
        remove: function(pk, callback) {
            callback();
        }
    };
    beforeEach(module("travelServices", function ($provide) {
        $provide.value("Passenger", mockPassenger);
    }));

    beforeEach(module('travelApp'));
    beforeEach(module('testUtils'));

    var $controller,
        Travel,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $controller = $injector.get('$controller');
            TestUtils = $injector.get('TestUtils');
            Travel = $injector.get('Travel');
        });
    });

    it('travelElementController instantiated as "there" will set the object to null when Travel.there is null',
        function() {
            var scope = {direction: 'there'};

            var ctrl = $controller('travelElementController', {$scope: scope});

            expect(ctrl.object.model).toBe(null);
        }
    );

    it('travelElementController instantiated as "there" will set the object to Travel.there',
        function() {
            var scope = {direction: 'there'};
            Travel.addPassenger(TestUtils.createPassengerThere('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});

            expect(ctrl.object.model.ride.num_of_free_seats).toBe(1);
        }
    );

    it('travelElementController instantiated as "there" will set the ride object',
        function() {
            var scope = {direction: 'there'};
            Travel.addPassenger(TestUtils.createPassengerThere('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});

            expect(ctrl.ride.pk).toBe('1');
        }
    );

    it('travelElementController instantiated as "back" will set the object to Travel.back',
        function() {
            var scope = {direction: 'back'};
            Travel.addPassenger(TestUtils.createPassengerBack('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});

            expect(ctrl.object.model.pk).toBe('1');
        }
    );

     it('travelElementController will not set the object and ride if the direction of the new passenger is not the same',
        function() {
            var scope = {direction: 'there'};
            var passenger = TestUtils.createPassengerBack('1');
            Travel.addPassenger(passenger);

            var ctrl = $controller('travelElementController', {$scope: scope});

            expect(ctrl.object.model).toBe(null);
            expect(ctrl.ride).toBe(null);
        }
    );

    it('travelElementController will set the object.model to null if the passenger is deleted',
        function() {
            var scope = {direction: 'there'};
            Travel.addPassenger(TestUtils.createPassengerThere('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});
            Travel.there.passenger.remove(Travel.there.passenger);

            expect(ctrl.object.model).toBe(null);
        }
    );

    it('travelElementController can remove the element',
        inject(function($rootScope) {
            var $scope = $rootScope.$new();
            $scope.direction = 'there';
            Travel.addPassenger(TestUtils.createPassengerThere('1'));
            var deferred = TestUtils.getMdDialogShowResponseDeferred();

            var ctrl = $controller('travelElementController', {$scope: $scope});
            ctrl.remove();

           TestUtils.resolveDeferred($scope, deferred);

            expect(ctrl.object.model).toBe(null);
        })
    );

    it('travelElementController will do nothing if another passenger is deleted',
        function() {
            var scope = {direction: 'there'};
            Travel.addPassenger(TestUtils.createPassengerThere('1'));
            Travel.addPassenger(TestUtils.createPassengerBack('2'));

            var ctrl = $controller('travelElementController', {$scope: scope});
            Travel.back.passenger.remove(Travel.back.passenger);

            expect(ctrl.object.model.pk).toBe('1');
        }
    );

    it('travelElementController will set the ride to null if the passenger is deleted',
        function() {
            var scope = {direction: 'there'};
            Travel.addPassenger(TestUtils.createPassengerThere('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});
            Travel.there.passenger.remove(Travel.there.passenger);

            expect(ctrl.ride).toBe(null);
        }
    );

    it('travelElementController will set the object and ride if a new passenger is added',
        function() {
            var scope = {direction: 'there'};
            var passenger = TestUtils.createPassengerThere('1');

            var ctrl = $controller('travelElementController', {$scope: scope});
            Travel.addPassenger(passenger);

            expect(ctrl.object.model.pk).toBe('1');
            expect(ctrl.ride.pk).toBe('1');
        }
    );

    it('travelElementController will not set the object and ride if the direction of the new passenger does not match',
        function() {
            var scope = {direction: 'there'};
            var passenger = TestUtils.createPassengerBack('1');

            var ctrl = $controller('travelElementController', {$scope: scope});
            Travel.addPassenger(passenger);

            expect(ctrl.object.model).toBe(null);
            expect(ctrl.ride).toBe(null);
        }
    );

});