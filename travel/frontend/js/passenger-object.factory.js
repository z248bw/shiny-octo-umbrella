(function () {
    'use strict';

    angular.module('TravelServices').factory('PassengerObject', PassengerObject);

    PassengerObject.$inject = ['$rootScope', 'Dialog', 'Passenger'];

    function PassengerObject($rootScope, Dialog, Passenger) {
        var passenger = {
            model: null,
            showAdd: function(event, ride) {
                Dialog.showPassengerJoin(event, {ride: ride});
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
    }
}());