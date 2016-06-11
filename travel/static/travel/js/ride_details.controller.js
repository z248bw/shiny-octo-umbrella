'use strict';

angular.module('travelApp')
    .controller('rideDetailsController', RidesDetailController);

function RidesDetailController($scope, $routeParams, $mdDialog, Ride, Travel) {

    var vm = this;
    vm.ride = null;
    vm.passengers = [];
    vm.showPassengerJoin = showPassengerJoin;
    vm.saveRide = null;
    vm.deleteRide = null;
    vm.shouldUpdateOnSave = false;

    var activate = function() {
        vm.showRideSaveDialog = showRideSaveDialog;
        vm.showRideDeleteDialog = showRideDeleteDialog;
        initRideDetails();
    };

    var showRideSaveDialog = function() {
        if (vm.shouldUpdateOnSave)
        {
            var confirm = $mdDialog.confirm()
                .title('Biztos vagy benne, hogy frissiteni akarod a jarmu tulajdonsagait?')
                .targetEvent(event)
                .ok('Igen')
                .cancel('Megse');

            $mdDialog.show(confirm).then(updateRide);
        }
        else
        {
            var confirm = $mdDialog.confirm()
                .title('Biztos vagy benne, hogy letre akarod hozni a jarmuvet?')
                .targetEvent(event)
                .ok('Igen')
                .cancel('Megse');

            $mdDialog.show(confirm).then(createRide);
        }
    };

    var updateRide = function() {
        Ride.update(vm.ride, function(response) {
//                TODO
                console.log('success');
            }, function(error) {
//                TODO
                console.log('error');
            });
    };

    var createRide = function() {
        Ride.save(vm.ride, function(response) {
    //            TODO
                console.log('success');
            }, function(error) {
    //            TODO
                console.log('error');
            })
    };

    var showRideDeleteDialog = function() {
        var confirm = $mdDialog.confirm()
            .title('Biztos vagy benne, hogy torolni akarod a jarmuvet?')
            .targetEvent(event)
            .ok('Igen')
            .cancel('Megse');

        $mdDialog.show(confirm).then(deleteRide);
    };

    var deleteRide = function() {
        Ride.remove({pk: vm.ride.pk}, function(response) {
//        TODO
            console.log('success');
        }, function(error) {
//        TODO
            console.log('error');
        });
    };

    var initRideDetails = function()
    {
        if (!('pk' in $routeParams))
        {
            return;
        }
        var pk = $routeParams.pk;
        getRide(pk);
        listPassengersOfRide(pk);
    };

    var getRide = function(pk) {
        Ride.get({pk: pk}, function(response) {
            vm.ride = response;
            vm.shouldUpdateOnSave = true;
        });
    };

    var listPassengersOfRide = function(pk) {
        Ride.getPassengers({pk: pk}, function(response) {
            vm.passengers = response;
        });
    };

    var showPassengerJoin = function(ev) {
        Travel.showPassengerJoin(ev, vm.ride.pk, function(passenger) {
            vm.passengers.push(passenger);
            vm.ride.num_of_free_seats--;
        });
    };

    activate();
}