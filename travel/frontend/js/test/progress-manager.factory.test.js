'use strict';

describe('Given a ProgressManager instance', function() {

    var mockDialog = {
        showSuccess: function(){}
    };

    beforeEach(module("TravelServices", function ($provide) {
        $provide.value("Dialog", mockDialog);
    }));
    beforeEach(module('TestUtils'));

    var $httpBackend,
        $rootScope,
        TravelManager,
        ProgressManager,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            TravelManager = $injector.get('TravelManager');
            ProgressManager = $injector.get('ProgressManager');
            TestUtils = $injector.get('TestUtils');
        });
    });

    it('while a new passenger is added isLoading is true',
        function() {
            var passengerModel = TestUtils.createPassengerThere('1');
            $httpBackend.expectPOST('/rest/1/passengers/').respond(passengerModel);
            TravelManager.getPassengerThere().add(passengerModel);
            expect(ProgressManager.isLoading()).toBe(true);
            $httpBackend.flush();
            expect(ProgressManager.isLoading()).toBe(false);
        }
    );

    it('while multiple new passenger is added isLoading is true',
        function() {
            var passengerModel = TestUtils.createPassengerThere('1');
            $httpBackend.expectPOST('/rest/1/passengers/').respond(passengerModel);
            $httpBackend.expectPOST('/rest/1/passengers/').respond(passengerModel);

            TravelManager.getPassengerThere().add(passengerModel);
            TravelManager.getPassengerBack().add(passengerModel);

            expect(ProgressManager.isLoading()).toBe(true);
            $httpBackend.flush(1);
            expect(ProgressManager.isLoading()).toBe(true);
            $httpBackend.flush(1);
            expect(ProgressManager.isLoading()).toBe(false);
        }
    );

    it('while a passenger is modified isLoading is true',
        function() {
            TestUtils.addPassengerThere('1');
            $httpBackend.expectPUT('/rest/1/passengers/1/').respond({});
            TravelManager.getPassengerThere().modify();
            expect(ProgressManager.isLoading()).toBe(true);
            $httpBackend.flush();
            expect(ProgressManager.isLoading()).toBe(false);
        }
    );

    it('while a passenger is deleted isLoading is true',
        function() {
            TestUtils.addPassengerThere('1');
            $httpBackend.expectDELETE('/rest/1/passengers/1/').respond({});
            TravelManager.getPassengerThere().remove();
            expect(ProgressManager.isLoading()).toBe(true);
            $httpBackend.flush();
            expect(ProgressManager.isLoading()).toBe(false);
        }
    );

    it('while a driver is added isLoading is true',
        function() {
            var ride = TestUtils.createRideThere('1');
            $httpBackend.expectPOST('/rest/1/rides/').respond(ride);
            TravelManager.getDriverThere().add(ride);
            expect(ProgressManager.isLoading()).toBe(true);
            $httpBackend.flush();
            expect(ProgressManager.isLoading()).toBe(false);
        }
    );

    it('while a driver is modified isLoading is true',
        function() {
            TestUtils.addDriverThere('1');
            $httpBackend.expectPUT('/rest/1/rides/1/').respond({});
            TravelManager.getDriverThere().modify();
            expect(ProgressManager.isLoading()).toBe(true);
            $httpBackend.flush();
            expect(ProgressManager.isLoading()).toBe(false);
        }
    );

    it('while a driver is deleted isLoading is true',
        function() {
            TestUtils.addDriverThere('1');
            $httpBackend.expectDELETE('/rest/1/rides/1/').respond({});
            TravelManager.getDriverThere().remove();
            expect(ProgressManager.isLoading()).toBe(true);
            $httpBackend.flush();
            expect(ProgressManager.isLoading()).toBe(false);
        }
    );

});