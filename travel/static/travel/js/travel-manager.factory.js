angular.module('travelServices').factory('TravelManager',
    ['$mdDialog', 'Travel', Travel]);

function Travel($mdDialog, Travel) {

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
}