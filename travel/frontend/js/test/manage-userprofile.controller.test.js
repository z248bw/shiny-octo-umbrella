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

    var createManageUserProfileController = function() {
        $httpBackend.expectGET('/rest/1/travel_users/me/')
            .respond(TestUtils.getMeResponse('1'));
        var ctrl = $controller('ManageUserProfileController');
        $httpBackend.flush();

        return ctrl;
    };

    it('upon instatiation it sets the profile',
        function() {
           var ctrl = createManageUserProfileController();

            expect(ctrl.travel_user.pk).toBe('1');
            expect(ctrl.travel_user.user.pk).toBe('1');
        }
    );

});