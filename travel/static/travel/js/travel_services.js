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

angular.module('travelServices').factory('Travel',
    ['$rootScope', '$mdDialog', 'Passenger', function($rootScope, $mdDialog, Passenger){

    var passenger = {
        model: null,
        add: function(event, ride) {
            showPassengerJoin(ride.pk)
        },
        modify: function() {
            //TODO
        },
        remove: function() {
            var passenger = this;
            var pk = passenger.model.pk;
            var deleted_passenger = passenger.model;
            Passenger.remove({pk: pk}, function() {
                $rootScope.$emit('PASSENGER_DELETED', deleted_passenger);
            });
        },
        getRide: function() {
            return this.model.ride;
        },
    };

    var driver = {
        model: null,
        add: function() {
            //TODO
        },
        modify: function() {
            //TODO
        },
        remove: function() {
            //TODO
        },
        getRide: function() {
            return this.model;
        }
    };

    var travel = {
        passenger: angular.copy(passenger),
        driver: angular.copy(driver),
        isDriving: function() {
            return this.passenger.model == null;
        }
    };

    var showPassengerJoin = function(event, ride) {
        $mdDialog.show({
              controller: 'passengerJoinController',
              templateUrl: '/static/travel/templates/passenger_join.html',
              parent: angular.element(document.body),
              targetEvent: event,
              locals: {
                ride: ride
              },
              clickOutsideToClose:true,
              fullscreen: false
        })
    };

    var addPassenger = function(travel, passenger) {
        if (passenger.ride.is_return)
        {
            travel.back.passenger.model = passenger;
            travel.back.driver.model = null;
        }
        else
        {
            travel.there.passenger.model = passenger;
            travel.there.driver.model = null;
        }
        $rootScope.$emit('PASSENGER_ADDED', passenger);
    };

    var addDriver = function(travel, driver) {
        if (ride.is_return)
        {
            travel.there.driver.model = ride;
            travel.there.passenger.model = null;
        }
        else
        {
            travel.back.driver.model = ride;
            travel.back.passenger.model = null;
        }
    };

    return {
        there : angular.copy(travel),
        back: angular.copy(travel),
        addPassenger: addPassenger,
        addDriver: addDriver,
        showPassengerJoin: showPassengerJoin
    };
}]);