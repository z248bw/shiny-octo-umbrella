'use strict';

describe('Given a TravelController', function() {

    beforeEach(module('TravelApp'));
    beforeEach(module('TestUtils'));

    var createMockTravelUser = function() {
        return {
            response: {
                driven_rides: [],
                passenger_of_rides: []
            }
        };
    };

    var $httpBackend,
        $controller,
        TestUtils,
        mockTravelUser;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $controller = $injector.get('$controller');
            TestUtils = $injector.get('TestUtils');
        });

        mockTravelUser = createMockTravelUser();
    });

    it('travelController instantiated with empty passengers and drivers',
        function() {
            $httpBackend.expectGET('/rest/1/travel_users/me/').respond(mockTravelUser.response);

            var ctrl = $controller('TravelController');

            $httpBackend.flush();
            expect(ctrl.there.passenger.model).toBe(null);
            expect(ctrl.back.passenger.model).toBe(null);
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        }
    );

    it('travelController instantiated with a passenger there',
        function() {
            mockTravelUser.response.passenger_of_rides.push(TestUtils.createPassengerThere('1'));
            $httpBackend.expectGET('/rest/1/travel_users/me/').respond(mockTravelUser.response);

            var ctrl = $controller('TravelController');

            $httpBackend.flush();
            expect(ctrl.there.passenger.model.pk).toBe('1');
            expect(ctrl.back.passenger.model).toBe(null);
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        }
    );

    it('travelController instantiated with a passenger back',
        function() {
            mockTravelUser.response.passenger_of_rides.push(TestUtils.createPassengerBack('1'));
            $httpBackend.expectGET('/rest/1/travel_users/me/').respond(mockTravelUser.response);

            var ctrl = $controller('TravelController');

            $httpBackend.flush();
            expect(ctrl.there.passenger.model).toBe(null);
            expect(ctrl.back.passenger.model.pk).toBe('1');
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        }
    );

    it('travelController instantiated with a passenger there and back',
        function() {
            mockTravelUser.response.passenger_of_rides.push(TestUtils.createPassengerThere('1'));
            mockTravelUser.response.passenger_of_rides.push(TestUtils.createPassengerBack('2'));
            $httpBackend.expectGET('/rest/1/travel_users/me/').respond(mockTravelUser.response);

            var ctrl = $controller('TravelController');

            $httpBackend.flush();
            expect(ctrl.there.passenger.model.pk).toBe('1');
            expect(ctrl.back.passenger.model.pk).toBe('2');
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        }
    );

});