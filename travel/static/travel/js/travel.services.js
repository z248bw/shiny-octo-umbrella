'use strict';

angular.module('travelServices', ['ngResource']);

angular.module('travelServices').factory('Ride', ['$resource', function($resource){
    return $resource('/rest/1/rides/:pk', null, {
        'getPassengers': {method: 'GET', url: '/rest/1/rides/:pk/passengers/', isArray: true},
        'update': {method: 'PUT', url: '/rest/1/rides/:pk', isArray: false}
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
    ['$rootScope', '$location', '$mdDialog', 'Passenger', 'Ride',
     function($rootScope, $location, $mdDialog, Passenger, Ride){

    var passenger = {
        model: null,
        add: function(event, ride) {
            showPassengerJoin(ride.pk)
        },
        modify: function(event) {
            showPassengerJoin(event, this.model);
        },
        remove: function() {
            var pk = this.model.pk;
            var deleted_passenger = this.model;
            Passenger.remove({pk: pk}, function() {
                $rootScope.$emit('PASSENGER_DELETED', deleted_passenger);
            });
        },
        getRide: function() {
            return this.model.ride;
        },
    };

    var showError = function(error) {
        $mdDialog.show(
           $mdDialog.alert()
             .parent(angular.element(document.body))
             .clickOutsideToClose(true)
             .title('Sikertelen tranzakcio!')
             .textContent(error)
             .ok('OK')
         );
    };

    var driver = {
        model: null,
        add: function() {
            var self = this;
            Ride.save(self.model, function(response) {
                self.model = response;
                $location.url('/rides');
            }, function(error) {
                showError(error);
            });
        },
        modify: function() {
            Ride.update(this.model, function(response) {
                $mdDialog.show(
                   $mdDialog.alert()
                     .parent(angular.element(document.body))
                     .clickOutsideToClose(true)
                     .title('Jarmu reszletek sikeresen frissitve!')
                     .ok('OK')
                 );
            }, function(error) {
                showError(error);
            });
        },
        remove: function() {
            var deleted_ride = this.model;
            Ride.remove({pk: this.model.pk}, function(response) {
                $rootScope.$emit('DRIVER_DELETED', deleted_ride);
            }, function(error) {
                showError(error);
            });
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

    var addPassenger = function(passenger) {
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
        $rootScope.$emit('PASSENGER_ADDED', passenger);
    };

    var addDriver = function(ride) {
        if (ride.is_return)
        {
            this.back.driver.model = ride;
            this.back.passenger.model = null;
        }
        else
        {
            this.there.driver.model = ride;
            this.there.passenger.model = null;
        }
        $rootScope.$emit('DRIVER_ADDED', ride);
    };

    return {
        there : angular.copy(travel),
        back: angular.copy(travel),
        addPassenger: addPassenger,
        addDriver: addDriver,
        showPassengerJoin: showPassengerJoin
    };
}]);