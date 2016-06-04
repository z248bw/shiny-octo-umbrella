describe('Given a TravelController', function() {

    beforeEach(module('travelApp'));
    beforeEach(module('testUtils'));

    var createMockTravelUser = function() {
        return {
            response: {
                driven_rides: [],
                passenger_of_rides: []
            }
        };
    };

    var $httpBackend;
    var mockTravelUser;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
        });

        mockTravelUser = createMockTravelUser();
    });

    it('travelController instantiated with empty passengers and drivers',
        inject(function($controller) {
            var scope = {};
            $httpBackend.expectGET('/rest/1/travel_users/me/').respond(mockTravelUser.response);

            var ctrl = $controller('travelController', {$scope: scope});

            $httpBackend.flush();
            expect(ctrl.there.passenger.model).toBe(null);
            expect(ctrl.back.passenger.model).toBe(null);
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        })
    );

    it('travelController instantiated with a passenger there',
        inject(function($controller, TestUtils) {
            var scope = {};
            mockTravelUser.response.passenger_of_rides.push(TestUtils.createPassengerThere('1'));
            $httpBackend.expectGET('/rest/1/travel_users/me/').respond(mockTravelUser.response);

            var ctrl = $controller('travelController', {$scope: scope});

            $httpBackend.flush();
            expect(ctrl.there.passenger.model.pk).toBe('1');
            expect(ctrl.back.passenger.model).toBe(null);
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        })
    );

    it('travelController instantiated with a passenger back',
        inject(function($controller, TestUtils) {
            var scope = {};
            mockTravelUser.response.passenger_of_rides.push(TestUtils.createPassengerBack('1'));
            $httpBackend.expectGET('/rest/1/travel_users/me/').respond(mockTravelUser.response);

            var ctrl = $controller('travelController', {$scope: scope});

            $httpBackend.flush();
            expect(ctrl.there.passenger.model).toBe(null);
            expect(ctrl.back.passenger.model.pk).toBe('1');
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        })
    );

    it('travelController instantiated with a passenger there and back',
        inject(function($controller, TestUtils) {
            var scope = {};
            mockTravelUser.response.passenger_of_rides.push(TestUtils.createPassengerThere('1'));
            mockTravelUser.response.passenger_of_rides.push(TestUtils.createPassengerBack('2'));
            $httpBackend.expectGET('/rest/1/travel_users/me/').respond(mockTravelUser.response);

            var ctrl = $controller('travelController', {$scope: scope});

            $httpBackend.flush();
            expect(ctrl.there.passenger.model.pk).toBe('1');
            expect(ctrl.back.passenger.model.pk).toBe('2');
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        })
    );

});