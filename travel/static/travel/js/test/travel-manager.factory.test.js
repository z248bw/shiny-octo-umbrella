'use strict';

describe('Given a TravelManager instance', function() {

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
        TravelManager,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            TravelManager = $injector.get('TravelManager');
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

    it('a passenger there can be added and only TravelManager.there will be set',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));
            expect(TravelManager.getPassengerThere().model.pk).toBe('1');
            expect(TravelManager.getDriverThere().model).toBe(null);
            expect(TravelManager.getPassengerBack().model).toBe(null);
            expect(TravelManager.getDriverBack().model).toBe(null);
        }
    );

    it('a driver there can be added and only TravelManager.there will be set',
        function() {
            TravelManager.addDriver(TestUtils.createRideThere('1'));
            expect(TravelManager.getDriverThere().model.pk).toBe('1');
            expect(TravelManager.getPassengerThere().model).toBe(null);
            expect(TravelManager.getPassengerBack().model).toBe(null);
            expect(TravelManager.getDriverBack().model).toBe(null);
        }
    );

    it('a passenger there and back can be added',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));
            TravelManager.addPassenger(TestUtils.createPassengerBack('2'));
            expect(TravelManager.getPassengerThere().model.pk).toBe('1');
            expect(TravelManager.getDriverThere().model).toBe(null);
            expect(TravelManager.getPassengerBack().model.pk).toBe('2');
            expect(TravelManager.getDriverBack().model).toBe(null);
        }
    );

    it('a driver there and back can be added',
        function() {
            TravelManager.addDriver(TestUtils.createRideThere('1'));
            TravelManager.addDriver(TestUtils.createRideBack('2'));
            expect(TravelManager.getDriverThere().model.pk).toBe('1');
            expect(TravelManager.getPassengerThere().model).toBe(null);
            expect(TravelManager.getPassengerBack().model).toBe(null);
            expect(TravelManager.getDriverBack().model.pk).toBe('2');
        }
    );

    it('a driver there and a passenger back can be added',
        function() {
            TravelManager.addDriver(TestUtils.createRideThere('1'));
            TravelManager.addPassenger(TestUtils.createPassengerBack('2'));
            expect(TravelManager.getDriverThere().model.pk).toBe('1');
            expect(TravelManager.getPassengerThere().model).toBe(null);
            expect(TravelManager.getPassengerBack().model.pk).toBe('2');
            expect(TravelManager.getDriverBack().model).toBe(null);
        }
    );

    it('a passenger there can be updated and only the TravelManager.there will be changed',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));
            TravelManager.addPassenger(TestUtils.createPassengerThere('2'));
            expect(TravelManager.getDriverThere().model).toBe(null);
            expect(TravelManager.getPassengerThere().model.pk).toBe('2');
            expect(TravelManager.getPassengerBack().model).toBe(null);
            expect(TravelManager.getDriverBack().model).toBe(null);
        }
    );

    it('a driver there can be updated and only the TravelManager.there will be changed',
        function() {
            TravelManager.addDriver(TestUtils.createRideThere('1'));
            TravelManager.addDriver(TestUtils.createRideThere('2'));
            expect(TravelManager.getDriverThere().model.pk).toBe('2');
            expect(TravelManager.getPassengerThere().model).toBe(null);
            expect(TravelManager.getPassengerBack().model).toBe(null);
            expect(TravelManager.getDriverBack().model).toBe(null);
        }
    );

    it('when a passenger is deleted it will be emit on the rootscope and the model will be set to null',
        inject(function($rootScope) {
            var passenger = TestUtils.createPassengerThere('1');
            var emittedPassenger = TestUtils.createPassengerThere('1');
            TravelManager.addPassenger(passenger);

            spyOn($rootScope, "$emit")
            TestUtils.removePassengerThere();
            expect($rootScope.$emit).toHaveBeenCalledWith("PASSENGER_DELETED", emittedPassenger);
            expect(TravelManager.getPassengerThere().model).toBe(null);
        })
    );

     it('when a driver is deleted it will be emit on the rootscope and the model will be set to null',
        inject(function($rootScope) {
            var driver = TestUtils.createRideThere('1');
            var emittedDriver = TestUtils.createRideThere('1');
            TravelManager.addDriver(driver);

            spyOn($rootScope, "$emit")
            TravelManager.getDriverThere().remove()

            expect($rootScope.$emit).toHaveBeenCalledWith("DRIVER_DELETED", emittedDriver);
            expect(TravelManager.getDriverThere().model).toBe(null);
        })
    );

    it('a passenger can be deleted and then added',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));
            TravelManager.getPassengerThere().remove();
            TravelManager.addPassenger(TestUtils.createPassengerThere('2'));
            expect(TravelManager.getPassengerThere().model.pk).toBe('2');
            expect(TravelManager.getDriverThere().model).toBe(null);
            expect(TravelManager.getPassengerBack().model).toBe(null);
            expect(TravelManager.getDriverBack().model).toBe(null);
        }
    );

    it('a driver can be deleted and then added',
        function() {
            TravelManager.addDriver(TestUtils.createRideThere('1'));
            TravelManager.getDriverThere().remove();
            TravelManager.addDriver(TestUtils.createRideThere('2'));
            expect(TravelManager.getDriverThere().model.pk).toBe('2');
            expect(TravelManager.getPassengerThere().model).toBe(null);
            expect(TravelManager.getPassengerBack().model).toBe(null);
            expect(TravelManager.getDriverBack().model).toBe(null);
        }
    );

    it('a isDriving returns false for passenger',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));
            expect(TravelManager.getTravelThere().isDriving()).toBe(false);
        }
    );

     it('a isDriving returns true for driver',
        function() {
            TravelManager.addDriver(TestUtils.createRideThere('1'));
            expect(TravelManager.getTravelThere().isDriving()).toBe(true);
        }
    );

    it('a isEmpty returns true when neither a driver nor a passenger exist in that direction',
        function() {
            expect(TravelManager.getTravelThere().isEmpty()).toBe(true);
        }
    );

    it('a isEmpty returns false when a driver exist in that direction',
        function() {
            TravelManager.addDriver(TestUtils.createRideThere('1'));
            expect(TravelManager.getTravelThere().isEmpty()).toBe(false);
        }
    );

    it('a isEmpty returns false when a passenger exist in that direction',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));
            expect(TravelManager.getTravelThere().isEmpty()).toBe(false);
        }
    );

    it('a isEmpty returns true when a passenger exist in the other direction',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));
            expect(TravelManager.getTravelBack().isEmpty()).toBe(true);
        }
    );

    it('getModelThere returns null if there is no passenger neither driver there',
        function() {
            expect(TravelManager.getModelThere()).toBe(null);
        }
    );

    it('getModelThere returns passenger model if there is a passenger there',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerThere('1'));
            expect(TravelManager.getModelThere().pk).toBe('1');
        }
    );

     it('getModelThere returns driver model if there is a driver there',
        function() {
            TravelManager.addDriver(TestUtils.createRideThere('1'));
            expect(TravelManager.getModelThere().pk).toBe('1');
        }
    );

    it('getModelThere returns null if there is a passenger back',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerBack('1'));
            expect(TravelManager.getModelThere()).toBe(null);
        }
    );

    it('getModelThere returns null if there is a driver back',
        function() {
            TravelManager.addDriver(TestUtils.createRideBack('1'));
            expect(TravelManager.getModelThere()).toBe(null);
        }
    );

    it('getModelThere returns passenger if there is a driver back',
        function() {
            TravelManager.addDriver(TestUtils.createRideBack('1'));
            TravelManager.addPassenger(TestUtils.createPassengerThere('2'));
            expect(TravelManager.getModelThere().pk).toBe('2');
        }
    );

    it('getModelThere returns passenger if there is a passenger back',
        function() {
            TravelManager.addPassenger(TestUtils.createPassengerBack('1'));
            TravelManager.addPassenger(TestUtils.createPassengerThere('2'));
            expect(TravelManager.getModelThere().pk).toBe('2');
        }
    );

});