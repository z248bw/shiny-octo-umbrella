'use strict';

describe('Given a UserProfile', function() {

    beforeEach(module('TravelServices'));
    beforeEach(module('TestUtils'));
    beforeEach(module('TravelApp'));

    var UserProfile,
        $httpBackend,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            UserProfile = $injector.get('UserProfile');
            $httpBackend = $injector.get('$httpBackend');
            TestUtils = $injector.get('TestUtils');
        });
    });

    var initUserProfile = function() {
        $httpBackend.expectGET('/rest/1/travel_users/me/')
                .respond(TestUtils.getMeResponse('1'));

        var userProfile = UserProfile.getUserProfile();
        $httpBackend.flush();

        return userProfile;
    };

    it('it fetches the current users details if it is not set yet',
        function() {
            var userProfile = initUserProfile();

            expect(userProfile.travel_user.user.pk).toBe('1');
        }
    );

    it('asking for the userprofile after it has been fetched does not result in additional request',
        function() {
            initUserProfile();

            expect(UserProfile.getUserProfile().travel_user.user.pk).toBe('1');
        }
    );

    it('it saves the profile details to the user and traveluser',
        function() {
            var profile = initUserProfile();
            profile.phone = '123';

            var travelUserRequest = angular.copy(profile.travel_user);
            travelUserRequest.user = profile.travel_user.user.pk;
            $httpBackend.expectPUT('/rest/1/travel_users/1/', travelUserRequest)
                .respond(profile.travel_user);

            var userRequest = profile.travel_user.user;
            $httpBackend.expectPUT('/rest/1/users/1/', userRequest)
                .respond(profile.travel_user.user);

            UserProfile.save(profile);

            $httpBackend.flush();
        }
    );

});