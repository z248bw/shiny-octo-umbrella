'use strict';

angular.module('travelServices', ['ngResource']);

angular.module('travelServices').factory('Ride', ['$resource', function($resource){
    return $resource('/rest/1/rides/:pk', null, {
        'getPassengers': {method: 'GET', url: '/rest/1/rides/:pk/passengers/', isArray: true},
        'update': {method: 'PUT', url: '/rest/1/rides/:pk/', isArray: false}
    });
}]);

angular.module('travelServices').factory('Passenger', ['$resource', function($resource){
    return $resource('/rest/1/passengers/:pk/', null, {
        'update': {method: 'PUT', url: '/rest/1/passengers/:pk/', isArray: false}
    });
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
        showAdd: function(event, ride) {
            this.model = {ride: ride};
            showPassengerJoin(event, this.model);
        },
        add: function(passenger) {      //TODO rename to save
            var ride = passenger.ride,
                self = this;
            passenger.ride = ride.pk;
            Passenger.save(passenger, function(response) {
                response = response.toJSON();
                response.ride = ride;
                self.model = response;
                $rootScope.$emit('PASSENGER_ADDED', response);
            }, function(error) {
                showError(error);
            });
        },
        showModify : function(event){
            showPassengerJoin(event, this.model);
        },
        modify: function(event) {
            var passenger = angular.copy(this.model);
            passenger.ride = passenger.ride.pk;
            Passenger.update({pk: this.model.pk}, passenger, function(response) {
                showSuccess('Utas reszletek sikeresen frissitve!');
            }, function(error) {
                showError(error);
            });
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

    var showSuccess = function(title) {
         $mdDialog.show(
           $mdDialog.alert()
             .parent(angular.element(document.body))
             .clickOutsideToClose(true)
             .title(title)
             .ok('OK')
         );
    }

    var driver = {
        model: null,
        add: function() {       //TODO rename to save
            var self = this;
            Ride.save(self.model, function(response) {
                self.model = response;
                $location.url('/rides');
            }, function(error) {
                showError(error);
            });
        },
        showModify : function(){
            $location.url('/create/ride/' + (this.model.is_return? 'back' : 'there'));
        },
        modify: function() {
            Ride.update({pk: this.model.pk}, this.model, function(response) {
                showSuccess('Jarmu reszletek sikeresen frissitve!');
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
        },
    };

    var travel = {
        passenger: angular.copy(passenger),
        driver: angular.copy(driver),
        isDriving: function() {
            return this.passenger.model == null;
        }
    };

    var showPassengerJoin = function(event, passengerModel) {
        $mdDialog.show({
              controller: 'passengerJoinController',
              templateUrl: '/static/travel/templates/passenger_join.html',
              parent: angular.element(document.body),
              targetEvent: event,
              locals: {
                passengerModel: passengerModel,
              },
              clickOutsideToClose:true,
              fullscreen: false
        });
    };

    var showManagePassengerDialog = function(event, ride)
    {
        if (ride.is_return)
        {
            this.back.passenger.showAdd(event, ride);
        }
        else
        {
            this.there.passenger.showAdd(event, ride);
        }
    }

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
    };

    return {
        there : angular.copy(travel),
        back: angular.copy(travel),
        addPassenger: addPassenger,
        addDriver: addDriver,
        showManagePassengerDialog: showManagePassengerDialog,
    };
}]);