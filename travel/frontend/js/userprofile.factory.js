(function () {
    'use strict';

    angular.module('TravelServices').factory('UserProfile', UserProfile);

    UserProfile.$inject = ['User', 'TravelUser'];

    function UserProfile(User, TravelUser) {
        var me = null;

        return {
            getUserProfile: getUserProfile,
            save: save
        };

        function getUserProfile() {
            if (me === null)
            {
                return TravelUser.getMe(function(response) {
                    me = response;
                });
            }

            return me;
        }

        function save(profile) {
            var profileRequest = angular.copy(me.travel_user);
            profileRequest.user = me.travel_user.user.pk;
            TravelUser.update({pk: profileRequest.pk}, profileRequest, function(response) {
                me.travel_user = response;
            });

            User.update({pk: me.travel_user.user.pk}, me.travel_user.user, function(response) {
                me.travel_user.user = response;
            });
        }
    }
}());