(function () {
    'use strict';

    angular.module('travelServices').factory('DriverObject', DriverObject);

    DriverObject.$inject = ['$rootScope', '$location', 'Dialog', 'Ride'];

    function DriverObject($rootScope, $location, Dialog, Ride) {
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

    }
}());