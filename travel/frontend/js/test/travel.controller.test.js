'use strict';

describe('Given a TravelController', function() {

    beforeEach(module('TravelApp'));
    beforeEach(module('TestUtils'));

    var createMockTravelUser = function(passenger_of_rides, driven_rides) {
        return {
                travel_user: {
                    user: {
                        pk: '1'
                    }
                },
                driven_rides: driven_rides,
                passenger_of_rides: passenger_of_rides
        };
    };

    var $httpBackend,
        $controller,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $controller = $injector.get('$controller');
            TestUtils = $injector.get('TestUtils');
        });
    });

    function createTravelControllerWithUser(passenger_of_rides, driven_rides) {
        $httpBackend.expectGET('/rest/1/travel_users/me/')
            .respond(createMockTravelUser(passenger_of_rides, driven_rides));
        var ctrl = $controller('TravelController');
        $httpBackend.flush();

        return ctrl;
    }

    it('travelController instantiated with empty passengers and drivers',
        function() {
            var ctrl = createTravelControllerWithUser([], []);
            expect(ctrl.there.passenger.model).toBe(null);
            expect(ctrl.back.passenger.model).toBe(null);
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        }
    );

    it('travelController instantiated with a passenger there',
        function() {
            var ctrl = createTravelControllerWithUser([TestUtils.createPassengerThere('1')], []);

            expect(ctrl.there.passenger.model.pk).toBe('1');
            expect(ctrl.back.passenger.model).toBe(null);
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        }
    );

    it('travelController instantiated with a passenger back',
        function() {
            var ctrl = createTravelControllerWithUser([TestUtils.createPassengerBack('1')], []);

            expect(ctrl.there.passenger.model).toBe(null);
            expect(ctrl.back.passenger.model.pk).toBe('1');
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        }
    );

    it('travelController instantiated with a passenger there and back',
        function() {
            var ctrl = createTravelControllerWithUser([
                TestUtils.createPassengerThere('1'),
                TestUtils.createPassengerBack('2')
            ], []);

            expect(ctrl.there.passenger.model.pk).toBe('1');
            expect(ctrl.back.passenger.model.pk).toBe('2');
            expect(ctrl.there.driver.model).toBe(null);
            expect(ctrl.back.driver.model).toBe(null);
        }
    );

    it('when clicking the manage profile button the user will be redirected to the manage profile page',
        inject(function($location) {
            var ctrl = createTravelControllerWithUser([], []);

            spyOn($location, 'path')
            ctrl.showManageUserProfile();
            expect($location.path).toHaveBeenCalledWith('/manage/userprofile');
        })
    );

    function createTravelControllerWithUser(passenger_of_rides, driven_rides) {
        $httpBackend.expectGET('/rest/1/travel_users/me/')
            .respond(createMockTravelUser(passenger_of_rides, driven_rides));
        var ctrl = $controller('TravelController');
        $httpBackend.flush();

        return ctrl;
    }

    it('when clicking the manage profile button the user will be redirected to the about page',
        inject(function(Dialog) {
            var ctrl = createTravelControllerWithUser([], []);
            $httpBackend.expectGET('/rest/1/app/about/')
            .respond({version: '0.1'});
            spyOn(Dialog, 'showSuccess')

            ctrl.showAbout();

            $httpBackend.flush();
            expect(Dialog.showSuccess).toHaveBeenCalledWith('Nevjegy', 'Verzio: ' + '0.1 Github: majd lesz');
        })
    );
});