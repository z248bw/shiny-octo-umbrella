'use strict';

angular.module('travelServices', ['ngResource']);

angular.module('travelServices').factory('Ride', ['$resource', function($resource){
    return $resource('/rest/1/rides/:pk/', null, {
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

angular.module('travelServices').factory('Dialog',
    ['$mdDialog',
    function($mdDialog) {

        function showPassengerJoin(event, passengerModel) {
            $mdDialog.show({
                  controller: 'passengerJoinController',
                  templateUrl: '/static/travel/templates/passenger_join.html',
                  parent: angular.element(document.body),   //TODO do i really need this?
                  targetEvent: event,
                  locals: {
                    passengerModel: passengerModel,
                  },
                  clickOutsideToClose:true,
                  fullscreen: false
            });
        }

        function showError(error) {
            $mdDialog.show(
               $mdDialog.alert()
                 .parent(angular.element(document.body))
                 .clickOutsideToClose(true)
                 .title('Sikertelen tranzakcio!')
                 .textContent(error)
                 .ok('OK')
             );
        }

        function showSuccess(title) {
             $mdDialog.show(
               $mdDialog.alert()
                 .parent(angular.element(document.body))
                 .clickOutsideToClose(true)
                 .title(title)
                 .ok('OK')
             );
        }

        return {
            showPassengerJoin: showPassengerJoin,
            showSuccess: showSuccess,
            showError: showError
        };

    }]
);

//TODO rename or refactor
angular.module('travelServices').factory('PassengerObject',
    ['$rootScope', 'Dialog', 'Passenger',
    function($rootScope, Dialog, Passenger) {
        var passenger = {
            model: null,
            showAdd: function(event, ride) {
                this.model = {ride: ride};
                Dialog.showPassengerJoin(event, this.model);
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
                    Dialog.showError(error);
                });
            },
            showModify : function(event){
                Dialog.showPassengerJoin(event, this.model);
            },
            modify: function(event) {
                var passenger = angular.copy(this.model);
                passenger.ride = passenger.ride.pk;
                Passenger.update({pk: this.model.pk}, passenger, function(response) {
                    Dialog.showSuccess('Utas reszletek sikeresen frissitve!');
                }, function(error) {
                    Dialog.showError(error);
                });
            },
            remove: function() {
                var self = this;
                Passenger.remove({pk: self.model.pk}, function() {
                    var deleted_passenger = angular.copy(self.model);
                    self.model = null;
                    $rootScope.$emit('PASSENGER_DELETED', deleted_passenger);
                });
            },
            getRide: function() {
                return this.model.ride;
            },
        };

        return {
            passenger: passenger
        };

    }]
);

angular.module('travelServices').factory('DriverObject',
    ['$rootScope', '$location', 'Dialog', 'Ride',
    function($rootScope, $location, Dialog, Ride) {

        var driver = {
            model: null,
            add: function() {       //TODO rename to save
                var self = this;
                Ride.save(self.model, function(response) {
                    self.model = response;
                    $rootScope.$emit('DRIVER_ADDED', response);
                }, function(error) {
                    Dialog.showError(error);
                });
            },
            showModify : function(){
                $location.url('/create/ride/' + (this.model.is_return? 'back' : 'there'));
            },
            modify: function() {
                Ride.update({pk: this.model.pk}, this.model, function(response) {
                    Dialog.showSuccess('Jarmu reszletek sikeresen frissitve!');
                }, function(error) {
                    Dialog.showError(error);
                });
            },
            remove: function() {
                var self = this;
                Ride.remove({pk: self.model.pk}, function(response) {
                    var deleted_ride = angular.copy(self.model);
                    self.model = null;
                    $rootScope.$emit('DRIVER_DELETED', deleted_ride);
                }, function(error) {
                    Dialog.showError(error);
                });
            },
            getRide: function() {
                return this.model;
            },
        };

        return {
            driver: driver
        };

    }]
);

angular.module('travelServices').factory('Travel',
    ['$rootScope', 'PassengerObject', 'DriverObject',
    function($rootScope, PassengerObject, DriverObject) {

        var travel = {
            passenger: angular.copy(PassengerObject.passenger),
            driver: angular.copy(DriverObject.driver),
            isDriving: function() {
                return this.passenger.model == null;
            },
            isEmpty: function() {
                if(this.isDriving())
                {
                    return (this.driver.model == null);
                }
                else
                {
                    return (this.passenger.model == null);
                }
            },
            getObject: function() {
                if(this.isEmpty())
                {
                    return null;
                }
                if(this.isDriving())
                {
                    return this.driver;
                }

                return this.passenger;
            }
        };

        return {
            travel: travel
        };
    }]
)

angular.module('travelServices').factory('TravelManager',
    ['$mdDialog', 'Travel',
     function($mdDialog, Travel){

    var there = angular.copy(Travel.travel);
    var back = angular.copy(Travel.travel);

     return {
        getPassengerThere: getPassengerThere,
        getPassengerBack: getPassengerBack,
        getDriverThere: getDriverThere,
        getDriverBack: getDriverBack,
        getTravelThere: getTravelThere,
        getTravelBack: getTravelBack,
        getModelThere: getModelThere,
        getModelBack: getModelBack,
        addPassenger: addPassenger,
        addDriver: addDriver,
        showManagePassengerDialog: showManagePassengerDialog,
    };

//    TODO test
    function showManagePassengerDialog(event, ride)
    {
        if (ride.is_return)
        {
            back.passenger.showAdd(event, ride);
        }
        else
        {
            there.passenger.showAdd(event, ride);
        }
    }

    function addPassenger(passenger) {
        if (passenger.ride.is_return)
        {
            back.passenger.model = passenger;
            back.driver.model = null;
        }
        else
        {
            there.passenger.model = passenger;
            there.driver.model = null;
        }
    }

    function addDriver(ride) {
        if (ride.is_return)
        {
            back.driver.model = ride;
            back.passenger.model = null;
        }
        else
        {
            there.driver.model = ride;
            there.passenger.model = null;
        }
    }

    function getTravelThere() {
        return there;
    }

    function getTravelBack() {
        return back;
    }

    function getModel(travel) {
        var object = travel.getObject();
        if (object === null)
        {
            return null;
        }
        return object.model;
    }

    function getModelThere() {
        return getModel(there);
    }

    function getModelBack() {
        return getModel(back);
    }

    function getDriverThere() {
        return there.driver;
    }

    function getDriverBack() {
        return back.driver;
    }

    function getPassengerThere() {
        return there.passenger;
    }

    function getPassengerBack() {
        return back.passenger;
    }
}]);