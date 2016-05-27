angular.module('travelApp')
    .controller('travelController', TravelController);

function TravelController($scope, TravelUser, Passenger, Travel) {

    var vm = this;
    vm.me = null;
    vm.there = Travel.there;
    vm.back = Travel.back;
    vm.deletePassenger = deletePassenger;

    TravelUser.getMe(function(response) {
        vm.me = response;
        initMyRides();
    });

    var initMyRides = function() {
        for (var i = 0; i < vm.me.driven_rides.length; i++)
        {
            var ride = vm.me.driven_rides[i];
            Travel.addDriver(ride);
        }
        for (var i = 0; i < vm.me.passenger_of_rides.length; i++)
        {
            var passenger = vm.me.passenger_of_rides[i];
            Travel.addPassenger(passenger);
        }
    };

    var deletePassenger = function(passenger) {
        Passenger.remove({pk: passenger.pk}, function(response) {
            if (vm.there.passenger.pk === passenger.pk)
            {
                vm.there.passenger = null;
            }
            else
            {
                vm.back.passenger = null;
            }
        })
    };

};