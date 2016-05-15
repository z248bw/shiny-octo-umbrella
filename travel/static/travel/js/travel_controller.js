travelApp.controller('travelController',
    function ($scope, TravelUser) {

    TravelUser.getMe(function(response) {
        $scope.me = response;
    });

});