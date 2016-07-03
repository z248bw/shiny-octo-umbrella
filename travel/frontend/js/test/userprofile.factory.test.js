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

    var requestSaveProfile = function(travel_user) {
        var travelUserRequest = angular.copy(travel_user);
        travelUserRequest.user = travel_user.user.pk;
        $httpBackend.expectPUT('/rest/1/travel_users/1/', travelUserRequest)
            .respond(travel_user);

        var userRequest = travel_user.user;
        $httpBackend.expectPUT('/rest/1/users/1/', userRequest)
            .respond(travel_user.user);

        return UserProfile.save(travel_user);
    };

    it('it saves the profile details to the user and traveluser',
        function() {
            var profile = initUserProfile();
            requestSaveProfile(profile.travel_user);
            $httpBackend.flush();
        }
    );

    it('after saving the userprofile will hold the new data',
        function() {
            var profile = initUserProfile();
            profile.travel_user.phone = '123';
            requestSaveProfile(profile.travel_user);
            $httpBackend.flush();
            profile = UserProfile.getUserProfile();
            expect(profile.travel_user.phone).toBe('123');
        }
    );

    it('after saving the promise returned will be resolved if all requests has been resolved',
        function() {
            var profile = initUserProfile();
            profile.travel_user.phone = '123';
            var result =requestSaveProfile(profile.travel_user);
            expect(result.$$state.status).toBe(0);
            $httpBackend.flush();
            expect(result.$$state.status).toBe(1);
        }
    );

    var requestRemoveProfile = function() {
         var profile = initUserProfile();
        requestSaveProfile(profile.travel_user);
        $httpBackend.flush();
        $httpBackend.expectDELETE('/rest/1/users/1/').respond({});
        return UserProfile.remove();
    };

    it('it deletes the user on backend when remove is called',
        function() {
            var result = requestRemoveProfile();
            expect(result.$promise.$$state.status).toBe(0);
            $httpBackend.flush();
            expect(result.$promise.$$state.status).toBe(1);
        }
    );

    var logout = function() {
        $httpBackend.expectPOST('/rest/1/users/1/logout/').respond({});
        UserProfile.logout();
        $httpBackend.flush();
    };

    it('it sends a logout request to the backend when the logout is called',
        function() {
            initUserProfile();
            logout();
        }
    );

    it('after fetching mine data isLoggedIn should be true',
        function() {
            initUserProfile();
            expect(UserProfile.isLoggedIn()).toBe(true);
        }
    );

    it('after logout isLoggedIn should be false',
        function() {
            initUserProfile();
            logout();
            expect(UserProfile.isLoggedIn()).toBe(false);
        }
    );
});