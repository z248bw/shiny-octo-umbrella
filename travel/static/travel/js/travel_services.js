angular.module('travelServices', ['ngResource']);

angular.module('travelServices').factory('Ride', ['$resource', function($resource){
    return $resource('/rest/1/rides/:pk', null, {
        'getPassengers': {method: 'GET', url: '/rest/1/rides/:pk/passengers/', isArray: true}
    });
}]);

angular.module('travelServices').factory('Passenger', ['$resource', function($resource){
    return $resource('/rest/1/passengers/:pk/');
}]);

angular.module('travelServices').factory('TravelUser', ['$resource', function($resource){
    return $resource('/rest/1/travel_users/:pk', null, {
        'getMe': {method: 'GET', url: '/rest/1/travel_users/me/', isArray: false}
    });
}]);

angular.module('travelServices').factory('Travel', ['$mdDialog', function($mdDialog){

    var passenger = {
        model: null,
        add: function(event, ride_pk) {
            showPassengerJoin(ride_pk)
        },
        modify: function(passenger_mode) {

        },
        remove: function(passenger_pk) {

        }
    };

    var driver = {
        model: null,
    };

    var travel = {
        passenger: angular.copy(passenger),
        driver: angular.copy(driver),
        isDriving: function() {
            return this.passenger.model == null;
        }
    };

    var showPassengerJoin = function(event, ride_pk) {
        $mdDialog.show({
              controller: 'passengerJoinController',
              templateUrl: '/static/travel/templates/passenger_join.html',
              parent: angular.element(document.body),
              targetEvent: event,
              locals: {
                ride_pk: ride_pk
              },
              clickOutsideToClose:true,
              fullscreen: false
        })
    };

    return {
        there : angular.copy(travel),
        back: angular.copy(travel),
        addPassenger: function(passenger)
        {
            if (passenger.ride.is_return)
            {
                this.back.passenger.model = passenger;
                this.back.driver.model = null;
            }
            else
            {
                this.there.passenger.model = passenger;
                this.there.driver.model = null;
            }
        },
        addDriver: function(ride)
        {
            if (ride.is_return)
            {
                this.there.driver.model = ride;
                this.there.passenger.model = null;
            }
            else
            {
                this.back.driver.model = ride;
                this.back.passenger.model = null;
            }
        },
        showPassengerJoin: showPassengerJoin
    };
}]);