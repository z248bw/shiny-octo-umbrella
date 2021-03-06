(function () {
'use strict';

angular.module('TravelServices').factory('Travel',
    ['$rootScope', 'PassengerObject', 'DriverObject', Travel]);

Travel.$inject = ['$rootScope', 'PassengerObject', 'DriverObject'];

function Travel($rootScope, PassengerObject, DriverObject) {

    var travel = {
        passenger: angular.copy(PassengerObject.passenger),
        driver: angular.copy(DriverObject.driver),
        isDriving: function() {
            return this.passenger.model === null;
        },
        isEmpty: function() {
            if(this.isDriving())
            {
                return (this.driver.model === null);
            }
            else
            {
                return (this.passenger.model === null);
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
}
}());
