'use strict';

describe('Given a RidesController', function() {

    beforeEach(module('TravelApp'));
    beforeEach(module('TravelServices'));
    beforeEach(module('TestUtils'));

    var $httpBackend,
        $controller,
        TravelManager,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $controller = $injector.get('$controller');
            TravelManager = $injector.get('TravelManager');
            TestUtils = $injector.get('TestUtils');
        });
    });

    function createControllerWithRides(rides) {
        $httpBackend.expectGET('/rest/1/rides/').respond(rides);
        var ctrl = $controller('RidesController', {$scope: {}});
        $httpBackend.flush();

        return ctrl;
    }

    it('when ride query contains empty lists nothing will be put on the there and back list',
        function() {
            var ctrl = createControllerWithRides([]);

            expect(ctrl.there.length).toBe(0);
            expect(ctrl.back.length).toBe(0);
        }
    );

    it('when ride query contains one ride there it will be put to the there list',
        function() {
            var ctrl = createControllerWithRides([TestUtils.createRideThere('1')])

            expect(ctrl.there[0].pk).toBe('1');
        }
    );

    it('when ride query contains two rides there they will be put to the there list',
        function() {
            var rides = [TestUtils.createRideThere('1'), TestUtils.createRideThere('2')];
            var ctrl = createControllerWithRides(rides);

            expect(ctrl.there[0].pk).toBe('1');
            expect(ctrl.there[1].pk).toBe('2');
        }
    );

    it('when ride query contains two rides there and back they will be put to the there and back list',
        function() {
            var rides = [TestUtils.createRideThere('1'), TestUtils.createRideBack('2')];
            var ctrl = createControllerWithRides(rides);

            expect(ctrl.there[0].pk).toBe('1');
            expect(ctrl.back[0].pk).toBe('2');
        }
    );

    it('if a passenger is added his ride will have one less free seats',
        function() {
            var ride = TestUtils.createRideThere('1');
            var ctrl = createControllerWithRides([ride])
            expect(ctrl.there[0].num_of_free_seats).toBe(1);

            var passenger = TestUtils.createPassengerThere('1');
            passenger.ride = ride;
            $httpBackend.expectPOST('/rest/1/passengers/').respond(passenger);
            TravelManager.getPassengerThere().add(passenger);
            $httpBackend.flush();

            expect(ctrl.there[0].num_of_free_seats).toBe(0);
        }
    );

    it('if a passenger is deleted his ride will have one more free seats',
        function() {
            var ctrl = createControllerWithRides([TestUtils.createRideThere('1')]);
            TravelManager.getPassengerThere().model = TestUtils.createPassengerThere('1');

            $httpBackend.expectDELETE('/rest/1/passengers/1/').respond({});
            TravelManager.getPassengerThere().remove();
            $httpBackend.flush();

            expect(ctrl.there[0].num_of_free_seats).toBe(2);
        }
    );

    it('if a driver is added his ride will appear in the list',
        function() {
            var ctrl = createControllerWithRides([TestUtils.createRideThere('1')]);

            var driver = TestUtils.createRideThere('1');
            $httpBackend.expectPOST('/rest/1/rides/').respond(driver);
            TravelManager.getDriverThere().add(driver);
            $httpBackend.flush();

            expect(ctrl.there.length).toBe(2);
        }
    );

    it('if a driver is deleted his ride will be removed from the list',
        function() {
            var rides = [
                    TestUtils.createRideThere('1'),
                    TestUtils.createRideThere('2'),
                    TestUtils.createRideThere('3')
            ];
            var ctrl = createControllerWithRides(rides);
            TravelManager.getDriverThere().model = TestUtils.createRideThere('2');

            $httpBackend.expectDELETE('/rest/1/rides/2/').respond({});
            TravelManager.getDriverThere().remove();
            $httpBackend.flush();

            expect(ctrl.there.length).toBe(2);
            expect(ctrl.there[0].pk).toBe('1');
            expect(ctrl.there[1].pk).toBe('3');
        }
    );

});