(function () {
    'use strict';

    angular.module('TravelServices').factory('PassengerObject', PassengerObject);

    PassengerObject.$inject = ['$rootScope', 'Dialog', 'Passenger', 'ProgressManager'];

    function PassengerObject($rootScope, Dialog, Passenger, ProgressManager) {
        var passenger = {
            model: null,
            showAdd: function(event, ride) {
                Dialog.showPassengerJoin(event, {ride: ride});
            },
            add: function(passenger) {      //TODO rename to save
                var ride = passenger.ride,
                    self = this;
                passenger.ride = ride.pk;
                ProgressManager.decorate({execute: function(){
                    return Passenger.save(passenger, function(response) {
                        response = response.toJSON();
                        response.ride = ride;
                        self.model = response;
                        $rootScope.$emit('PASSENGER_ADDED', response);
                    }, function(error) {
                        Dialog.showError(error);
                    }).$promise;
                }});
            },
            showModify : function(event){
                Dialog.showPassengerJoin(event, this.model);
            },
            modify: function() {
                var passenger = angular.copy(this.model);
                passenger.ride = passenger.ride.pk;
                ProgressManager.decorate({execute: function(){
                    return Passenger.update({pk: passenger.pk}, passenger, function(response) {
                        Dialog.showSuccess('Utas reszletek sikeresen frissitve!');
                    }, function(error) {
                        Dialog.showError(error);
                    }).$promise;
                }});
            },
            remove: function() {
                var self = this;
                ProgressManager.decorate({execute: function(){
                    return Passenger.remove({pk: self.model.pk}, function() {
                        var deleted_passenger = angular.copy(self.model);
                        self.model = null;
                        $rootScope.$emit('PASSENGER_DELETED', deleted_passenger);
                    }).$promise;
                }});
            },
            getRide: function() {
                return this.model.ride;
            },
        };

        return {
            passenger: passenger
        };
    }
}());