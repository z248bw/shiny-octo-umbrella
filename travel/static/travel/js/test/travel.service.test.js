'use strict';

describe('Given a Travel instance', function() {

    var mockDialog = {};
    var mockRide = {
        remove: function(pk, onSuccess) {
            onSuccess();
        }
    };

    beforeEach(module("travelServices", function ($provide) {
        $provide.value("$mdDialog", mockDialog);
        $provide.value("Ride", mockRide);
    }));

    beforeEach(module('testUtils'));

    var $httpBackend,
        $rootScope,
        Travel,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            Travel = $injector.get('Travel');
            TestUtils = $injector.get('TestUtils');
        });
    });

    it('on passenger add the new passenger will be emitted on the rootscope',
        function() {
            spyOn($rootScope, "$emit")
            TestUtils.addPassengerThere('1');
            expect($rootScope.$emit).toHaveBeenCalledWith("PASSENGER_ADDED", TestUtils.createPassengerThere('1'));
        }
    );

    it('a passenger there can be added and only Travel.there will be set',
        function() {
            Travel.addPassenger(TestUtils.createPassengerThere('1'));
            expect(Travel.there.passenger.model.pk).toBe('1');
            expect(Travel.there.driver.model).toBe(null);
            expect(Travel.back.passenger.model).toBe(null);
            expect(Travel.back.driver.model).toBe(null);
        }
    );

    it('a driver there can be added and only Travel.there will be set',
        function() {
            Travel.addDriver(TestUtils.createRideThere('1'));
            expect(Travel.there.driver.model.pk).toBe('1');
            expect(Travel.there.passenger.model).toBe(null);
            expect(Travel.back.passenger.model).toBe(null);
            expect(Travel.back.driver.model).toBe(null);
        }
    );

    it('a passenger there and back can be added',
        function() {
            Travel.addPassenger(TestUtils.createPassengerThere('1'));
            Travel.addPassenger(TestUtils.createPassengerBack('2'));
            expect(Travel.there.passenger.model.pk).toBe('1');
            expect(Travel.there.driver.model).toBe(null);
            expect(Travel.back.passenger.model.pk).toBe('2');
            expect(Travel.back.driver.model).toBe(null);
        }
    );

    it('a driver there and back can be added',
        function() {
            Travel.addDriver(TestUtils.createRideThere('1'));
            Travel.addDriver(TestUtils.createRideBack('2'));
            expect(Travel.there.driver.model.pk).toBe('1');
            expect(Travel.there.passenger.model).toBe(null);
            expect(Travel.back.driver.model.pk).toBe('2');
            expect(Travel.back.passenger.model).toBe(null);
        }
    );

    it('a driver there and a passenger back can be added',
        function() {
            Travel.addDriver(TestUtils.createRideThere('1'));
            Travel.addPassenger(TestUtils.createPassengerBack('2'));
            expect(Travel.there.driver.model.pk).toBe('1');
            expect(Travel.there.passenger.model).toBe(null);
            expect(Travel.back.passenger.model.pk).toBe('2');
            expect(Travel.back.driver.model).toBe(null);
        }
    );

    it('a passenger there can be updated and only the Travel.there will be changed',
        function() {
            Travel.addPassenger(TestUtils.createPassengerThere('1'));
            Travel.addPassenger(TestUtils.createPassengerThere('2'));
            expect(Travel.there.passenger.model.pk).toBe('2');
            expect(Travel.there.driver.model).toBe(null);
            expect(Travel.back.passenger.model).toBe(null);
            expect(Travel.back.driver.model).toBe(null);
        }
    );

    it('a driver there can be updated and only the Travel.there will be changed',
        function() {
            Travel.addDriver(TestUtils.createRideThere('1'));
            Travel.addDriver(TestUtils.createRideThere('2'));
            expect(Travel.there.driver.model.pk).toBe('2');
            expect(Travel.there.passenger.model).toBe(null);
            expect(Travel.back.passenger.model).toBe(null);
            expect(Travel.back.driver.model).toBe(null);
        }
    );

    it('when a passenger is deleted it will be emit on the rootscope and the model will be set to null',
        inject(function($rootScope) {
            var passenger = TestUtils.createPassengerThere('1');
            var emittedPassenger = TestUtils.createPassengerThere('1');
            Travel.there.passenger.model = passenger;

            spyOn($rootScope, "$emit")
            TestUtils.removePassengerThere();
            expect($rootScope.$emit).toHaveBeenCalledWith("PASSENGER_DELETED", emittedPassenger);
            expect(Travel.there.passenger.model).toBe(null);
        })
    );

     it('when a driver is deleted it will be emit on the rootscope and the model will be set to null',
        inject(function($rootScope) {
            var driver = TestUtils.createRideThere('1');
            var emittedDriver = TestUtils.createRideThere('1');
            Travel.addDriver(driver);

            spyOn($rootScope, "$emit")
            Travel.there.driver.remove();
            expect($rootScope.$emit).toHaveBeenCalledWith("DRIVER_DELETED", emittedDriver);
            expect(Travel.there.driver.model).toBe(null);
        })
    );

    it('a passenger can be deleted and then added',
        function() {
            Travel.addPassenger(TestUtils.createPassengerThere('1'));
            Travel.there.passenger.remove();
            Travel.addPassenger(TestUtils.createPassengerThere('2'));
            expect(Travel.there.passenger.model.pk).toBe('2');
            expect(Travel.there.driver.model).toBe(null);
            expect(Travel.back.passenger.model).toBe(null);
            expect(Travel.back.driver.model).toBe(null);
        }
    );

    it('a driver can be deleted and then added',
        function() {
            Travel.addDriver(TestUtils.createRideThere('1'));
            Travel.there.driver.remove();
            Travel.addDriver(TestUtils.createRideThere('2'));
            expect(Travel.there.driver.model.pk).toBe('2');
            expect(Travel.there.passenger.model).toBe(null);
            expect(Travel.back.passenger.model).toBe(null);
            expect(Travel.back.driver.model).toBe(null);
        }
    );

    it('a isDriving returns false for passenger',
        function() {
            Travel.addPassenger(TestUtils.createPassengerThere('1'));
            expect(Travel.there.isDriving()).toBe(false);
        }
    );

     it('a isDriving returns true for driver',
        function() {
            Travel.addDriver(TestUtils.createRideThere('1'));
            expect(Travel.there.isDriving()).toBe(true);
        }
    );

    it('a isEmpty returns true when neither a driver nor a passenger exist in that direction',
        function() {
            expect(Travel.there.isEmpty()).toBe(true);
        }
    );

    it('a isEmpty returns false when a driver exist in that direction',
        function() {
            Travel.addDriver(TestUtils.createRideThere('1'));
            expect(Travel.there.isEmpty()).toBe(false);
        }
    );

    it('a isEmpty returns false when a passenger exist in that direction',
        function() {
            Travel.addPassenger(TestUtils.createPassengerThere('1'));
            expect(Travel.there.isEmpty()).toBe(false);
        }
    );

    it('a isEmpty returns true when a passenger exist in the other direction',
        function() {
            Travel.addPassenger(TestUtils.createPassengerThere('1'));
            expect(Travel.back.isEmpty()).toBe(true);
        }
    );

});