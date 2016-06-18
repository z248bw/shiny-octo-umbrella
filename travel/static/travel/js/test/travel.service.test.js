'use strict';

describe('Given a Travel instance', function() {

    var mockDialog = {};
    var mockPassenger = {
        remove: function(pk, onSuccess) {
            onSuccess();
        }
    };
    var mockRide = {
        remove: function(pk, onSuccess) {
            onSuccess();
        }
    };

    beforeEach(module("travelServices", function ($provide) {
        $provide.value("$mdDialog", mockDialog);
        $provide.value("Passenger", mockPassenger);
        $provide.value("Ride", mockRide);
    }));

    beforeEach(module('testUtils'));

    var Travel,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            Travel = $injector.get('Travel');
            TestUtils = $injector.get('TestUtils');
        });
    });

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

    it('when a passenger is added it will be emitted on the rootscope',
        inject(function($rootScope) {
            var passenger = TestUtils.createPassengerThere('1');
            var emittedPassenger = TestUtils.createPassengerThere('1');

            spyOn($rootScope, "$emit")
            Travel.addPassenger(passenger);
            expect($rootScope.$emit).toHaveBeenCalledWith("PASSENGER_ADDED", emittedPassenger);
        })
    );

     it('when a driver is added it will be emitted on rootscope',
        inject(function($rootScope) {
            var driver = TestUtils.createRideThere('1');
            var emittedDriver= TestUtils.createRideThere('1');

            spyOn($rootScope, "$emit")
            Travel.addDriver(driver);
            expect($rootScope.$emit).toHaveBeenCalledWith("DRIVER_ADDED", emittedDriver);
        })
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

    it('when a passenger is deleted it will be emit on the rootscope',
        inject(function($rootScope) {
            var passenger = TestUtils.createPassengerThere('1');
            var emittedPassenger = TestUtils.createPassengerThere('1');
            Travel.addPassenger(passenger);

            spyOn($rootScope, "$emit")
            Travel.there.passenger.remove();
            expect($rootScope.$emit).toHaveBeenCalledWith("PASSENGER_DELETED", emittedPassenger);
        })
    );

     it('when a driver is deleted it will be emit on the rootscope',
        inject(function($rootScope) {
            var driver = TestUtils.createRideThere('1');
            var emittedDriver = TestUtils.createRideThere('1');
            Travel.addDriver(driver);

            spyOn($rootScope, "$emit")
            Travel.there.driver.remove();
            expect($rootScope.$emit).toHaveBeenCalledWith("DRIVER_DELETED", emittedDriver);
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

});