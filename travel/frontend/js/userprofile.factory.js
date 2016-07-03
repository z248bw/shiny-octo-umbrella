(function () {
    'use strict';

    angular.module('TravelServices').factory('UserProfile', UserProfile);

    UserProfile.$inject = ['$q', 'User', 'TravelUser'];

    function UserProfile($q, User, TravelUser) {
        var me = null;

        return {
            getUserProfile: getUserProfile,
            save: save,
            remove: remove
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
            var profileRequest = angular.copy(profile);
            profileRequest.user = profileRequest.user.pk;
            var travel_user = TravelUser.update({pk: profileRequest.pk}, profileRequest, function(response) {
                me.travel_user = response;
            });

            var user = User.update({pk: profile.user.pk}, profile.user, function(response) {
                me.travel_user.user = response;
            });

            return $q.all([travel_user, user]);
        }

        function remove() {
            return User.remove({pk: me.travel_user.user.pk});
        }
    }
}());