(function () {
    'use strict';

    angular.module('TravelServices').factory('DriverObject', DriverObject);

    DriverObject.$inject = ['$rootScope', '$location', 'Dialog', 'Ride', 'ProgressManager'];

    function DriverObject($rootScope, $location, Dialog, Ride, ProgressManager) {
        var driver = {
            model: null,
            add: function() {       //TODO rename to save
                var self = this;
                ProgressManager.decorate({execute:function(){
                    return Ride.save(self.model, function(response) {
                        self.model = response;
                        $rootScope.$emit('DRIVER_ADDED', response);
                    }, function(error) {
                        Dialog.showError(error);
                    }).$promise;
                }});
            },
            showModify : function(){
                $location.url('/manage/ride/' + (this.model.is_return? 'back' : 'there'));
            },
            modify: function() {
                var self = this;
                ProgressManager.decorate({execute:function(){
                    return Ride.update({pk: self.model.pk}, self.model, function(response) {
                        Dialog.showSuccess('Jarmu reszletek sikeresen frissitve!');
                    }, function(error) {
                        Dialog.showError(error);
                    }).$promise;
                }});
            },
            remove: function() {
                var self = this;
                ProgressManager.decorate({execute:function(){
                    return Ride.remove({pk: self.model.pk}, function(response) {
                        var deleted_ride = angular.copy(self.model);
                        self.model = null;
                        $rootScope.$emit('DRIVER_DELETED', deleted_ride);
                    }, function(error) {
                        Dialog.showError(error);
                    }).$promise;
                }});
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