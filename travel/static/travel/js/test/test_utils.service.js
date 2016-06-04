angular.module('testUtils', []).factory('TestUtils', function() {
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

    return {
        createPassengerThere: createPassengerThere,
        createPassengerBack: createPassengerBack,
        createRideThere: createRideThere,
        createRideBack: createRideBack,
    };
});
