'use strict';

angular.module('TestUtils', ['ngMaterial']);

angular.module('TestUtils').config(TestUtilsConfig);

function TestUtilsConfig($resourceProvider, $httpProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}

angular.module('TestUtils').factory('TestUtils',
    ['$q', '$httpBackend', 'TravelManager', '$mdDialog', TestUtils]);

//TODO investigate the splitting of this service
function TestUtils($q, $httpBackend, TravelManager, $mdDialog) {
    var createPassenger = function(pk, isReturn) {
        return {
            pk: pk,
            ride: createRide(pk, isReturn)
        };
    };

    var createRide = function(pk, isReturn) {
        return {
            pk: pk,
            is_return: isReturn,
            num_of_free_seats: 1
        };
    };

    var createRideThere = function(pk) {
        return createRide(pk, false);
    };

    var createRideBack = function(pk) {
        return createRide(pk, true);
    };

    var createPassengerThere = function(pk) {
        return createPassenger(pk, false);
    };

    var createPassengerBack = function(pk) {
        return createPassenger(pk, true);
    };

     var getMdDialogShowResponseDeferred = function() {
        var deferred = $q.defer();
        spyOn($mdDialog, "show").and.returnValue(deferred.promise);

        return deferred;
    };

    var resolveDeferred = function($scope, deferred) {
        deferred.resolve();
        $scope.$apply();
    };

    var addPassengerThere = function(pk) {
        var passengerModel = createPassengerThere(pk);
        $httpBackend.expectPOST('/rest/1/passengers/').respond(passengerModel);
        TravelManager.getPassengerThere().add(passengerModel);
        $httpBackend.flush();
    };

    var removePassengerThere = function() {
        $httpBackend.expectDELETE('/rest/1/passengers/'
            + TravelManager.getPassengerThere().model.pk + '/').respond({});
        TravelManager.getPassengerThere().remove();
        $httpBackend.flush();
    };

    var addDriverThere = function(pk) {
        var rideModel = createRideThere(pk);
        $httpBackend.expectPOST('/rest/1/rides/').respond(rideModel);
        TravelManager.getDriverThere().add(rideModel);
        $httpBackend.flush();
    };

    var removeDriverThere = function() {
        $httpBackend.expectDELETE('/rest/1/rides/'
            + TravelManager.getDriverThere().model.pk + '/').respond({});
        TravelManager.getDriverThere().remove();
        $httpBackend.flush();
    };

    var getMeResponse = function(pk) {
        return {
            travel_user: {
                pk: pk,
                user: {
                    pk: pk
                }
            },
            driven_rides: [],
            passenger_of_rides: []
        };
    };

    return {
        createPassengerThere: createPassengerThere,
        createPassengerBack: createPassengerBack,
        createRideThere: createRideThere,
        createRideBack: createRideBack,
        getMdDialogShowResponseDeferred: getMdDialogShowResponseDeferred,
        resolveDeferred: resolveDeferred,
        addPassengerThere: addPassengerThere,
        removePassengerThere: removePassengerThere,
        addDriverThere: addDriverThere,
        removeDriverThere: removeDriverThere,
        getMeResponse: getMeResponse
    };
}
