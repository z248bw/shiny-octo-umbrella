'use strict';

describe('Given a ManageUserProfileController', function() {

    beforeEach(module('TravelApp'));
    beforeEach(module('TestUtils'));

    var $controller,
        $httpBackend,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $controller = $injector.get('$controller');
            $httpBackend = $injector.get('$httpBackend');
            TestUtils = $injector.get('TestUtils');
        });
    });

    it('upon instatiation it sets the profile',
        function() {
            $httpBackend.expectGET('/rest/1/travel_users/me/')
                .respond(TestUtils.getMeResponse('1'));
            var ctrl = $controller('ManageUserProfileController');
            $httpBackend.flush();

            expect(ctrl.travel_user.pk).toBe('1');
            expect(ctrl.travel_user.user.pk).toBe('1');
        }
    );

});