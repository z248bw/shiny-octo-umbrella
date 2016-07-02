'use strict';

angular
    .module('travelApp', ['ngResource', 'ngRoute', 'ngMaterial', 'travelServices'])
    .config(TravelAppConfig);

angular.module('travelServices', ['ngResource']);

function TravelAppConfig($resourceProvider, $httpProvider, $routeProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

     $routeProvider.
      when('/rides/:pk', {
        templateUrl: '/static/travel/templates/ride_details.html',
        controller: 'rideDetailsController'
      }).
      when('/create/ride/:direction', {     //TODO rename to manage/ride/:direction
        templateUrl: '/static/travel/templates/manage_ride.html',
        controller: 'rideDetailsController'
      }).
      otherwise({
        redirectTo: '/rides',
        templateUrl: '/static/travel/templates/rides.html'
      });
}

'use strict'

angular.module('travelServices').factory('Dialog', Dialog);

Dialog.$inject = ['$mdDialog'];

function Dialog($mdDialog) {
    return {
        showPassengerJoin: showPassengerJoin,
        showSuccess: showSuccess,
        showError: showError,
        showConfirm: showConfirm
    };

    function showPassengerJoin(event, passengerModel) {
        $mdDialog.show({
              controller: 'passengerJoinController',
              templateUrl: '/static/travel/templates/passenger_join.html',
              parent: angular.element(document.body),   //TODO do i really need this?
              targetEvent: event,
              locals: {
                passengerModel: passengerModel,
              },
              clickOutsideToClose:true,
              fullscreen: false
        });
    }

    function showError(error) {
        $mdDialog.show(
           $mdDialog.alert()
             .parent(angular.element(document.body))
             .clickOutsideToClose(true)
             .title('Sikertelen tranzakcio!')
             .textContent(error)
             .ok('OK')
         );
    }

    function showSuccess(title) {
         $mdDialog.show(
           $mdDialog.alert()
             .parent(angular.element(document.body))
             .clickOutsideToClose(true)
             .title(title)
             .ok('OK')
         );
    }

    function showConfirm(event, title, callback) {
        var confirm = $mdDialog.confirm()
        .title(title)
        .targetEvent(event)
        .ok('Igen')
        .cancel('Megse');

        $mdDialog.show(confirm).then(callback);
    }
}
'use strict'

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
'use strict';

angular.module('travelApp')
    .controller('manageRideController', ManageRideController);

ManageRideController.$inject = [
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    'Dialog',
    'Ride',
    'Passenger',
    'TravelManager'
];


function ManageRideController($scope, $rootScope, $location, $routeParams, Dialog, Ride, Passenger, TravelManager) {

    var vm = this;
    vm.driver = null;
    vm.passengers = [];
    vm.showDriverSaveDialog = showDriverSaveDialog;
    vm.showDriverDeleteDialog = showDriverDeleteDialog;
    vm.showPassengerDeleteDialog = showPassengerDeleteDialog;
    vm.isDriverExists = isDriverExists;


    $scope.$on('DATETIME_CHANGED', function(event, timepicker) {
        vm.driver.model.start_time = timepicker.datetime;
    });
    $rootScope.$on('DRIVER_ADDED', navigateToRides);
    $rootScope.$on('DRIVER_DELETED', navigateToRides);

    var shouldUpdateOnSave = false;

    function navigateToRides() {
        $location.url('/rides');
    }

    var activate = function() {
        vm.driver = getDriver();
        fetchPassengers();
        initSave();
    };

    function getDriver() {
        if (!('direction' in $routeParams))
        {
            throw new Error('Direction not specified');
        }

        return getDriverByDirection($routeParams.direction);
    };

    function getDriverByDirection(direction) {
        var driver;
        if (direction === 'there')
        {
            driver = TravelManager.getDriverThere();
        }
        else
        {
            driver = TravelManager.getDriverBack();
        }
        return initDriverDirection(driver, direction)
    };

    function initDriverDirection(driver, direction) {
        if (driver.model == null)
        {
            driver.model = {is_return: direction === 'there' ? false : true};
        }
        return driver;
    };

    function fetchPassengers() {
        if (!isDriverExists())
        {
            return;
        }

        Ride.getPassengers({pk: vm.driver.model.pk}, function(response) {
            vm.passengers = response;
        });
    };

    function isDriverExists() {
        return vm.driver.model.pk != null;
    };

    function initSave() {
        if (isDriverExists())
        {
            shouldUpdateOnSave = true;
        }
    };

    function showDriverSaveDialog(event) {
        if (shouldUpdateOnSave)
        {
            Dialog.showConfirm(
                event,
                'Biztos vagy benne, hogy frissiteni akarod a jarmu tulajdonsagait?',
                updateDriver);
        }
        else
        {
            Dialog.showConfirm(
                event,
                'Biztos vagy benne, hogy letre akarod hozni a jarmuvet?',
                createDriver);
        }
    };

    function updateDriver() {
       vm.driver.modify();
    };

    function createDriver() {
        vm.driver.add();
    };

    function showDriverDeleteDialog(event) {
        Dialog.showConfirm(
            event,
            'Biztos vagy benne, hogy torolni akarod a jarmuvet?',
            deleteDriver);
    };

    function deleteDriver() {
        vm.driver.remove();
    };

    function showPassengerDeleteDialog(event) {
        Dialog.showConfirm(
            event,
            'Biztos vagy benne, hogy torolni szeretned ezt az utast?',
            removeSelectedPassengers
        );
    };

    function removeSelectedPassengers() {
        var selectedPassengers = getSelectedPassengers();
        for (var i = 0; i < selectedPassengers.length; i++)
        {
            var passenger = selectedPassengers[i];
            Passenger.remove({pk: passenger.pk}, function() {
                removeFromPassengers(passenger);
            });
        }
    }

    function getSelectedPassengers() {
        var selectedPassengers = [];
        for(var i = 0; i < vm.passengers.length; i++)
        {
            if(vm.passengers[i].selected)
            {
                selectedPassengers.push(vm.passengers[i]);
            }
        }
        return selectedPassengers;
    }

    function removeFromPassengers(passenger) {
        vm.passengers.splice(getIndexOfPassenger(passenger), 1);
     }

    function getIndexOfPassenger(passenger) {
        for(var i = 0; i < vm.passengers.length; i++)
        {
            if (vm.passengers[i].pk === passenger.pk)
            {
                return i;
            }
        }
    }

    activate();
}
'use strict';

angular.module('travelApp')
    .controller('passengerJoinController',PassengerJoinController);

PassengerJoinController.$inject = ['$scope', '$mdDialog', 'TravelManager', 'passengerModel'];

function PassengerJoinController($scope, $mdDialog, TravelManager, passengerModel) {

    $scope.passenger = passengerModel;
    $scope.joinRide = function()
    {
        $mdDialog.hide();
         if ($scope.passenger.pk == null)
        {
            savePassenger();
        }
        else
        {
            updatePassenger();
        }
    };

    var savePassenger = function() {
        getPassenger().add($scope.passenger);
    };

    var getPassenger = function() {
        if (passengerModel.ride.is_return)
        {
            return TravelManager.getPassengerBack();
        }
        else
        {
            return TravelManager.getPassengerThere();
        }
    };

    var updatePassenger = function() {
        getPassenger().modify($scope.passenger);
    };

}
'use strict'

angular.module('travelServices').factory('PassengerObject', PassengerObject);

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
'use strict'

angular.module('travelServices').factory('Passenger', Passenger);

Passenger.$inject = ['$resource'];

function Passenger($resource) {
    return $resource('/rest/1/passengers/:pk/', null, {
        'update': {method: 'PUT', url: '/rest/1/passengers/:pk/', isArray: false}
    });
}
'use strict';

angular.module('travelApp')
    .controller('rideDetailsController', RidesDetailController);

RidesDetailController.$inject = ['$routeParams', 'Ride'];

function RidesDetailController($routeParams, Ride) {

    var vm = this;
    vm.ride = null;
    vm.passengers = [];

    var activate = function() {
        initRideDetails();
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

    activate();
}
'use strict';

angular.module('travelApp')
    .controller('rideElementController', RideElementController);

RideElementController.$inject = ['$rootScope', '$scope', 'TravelManager'];

function RideElementController($rootScope, $scope, TravelManager) {

    var vm = this;
    vm.ride = null;
    vm.isJoinable = false;
    vm.showPassengerJoin = null;

    var action = function() {
        vm.ride = $scope.ride;
        configureIsJoinable();
        vm.showPassengerJoin = showPassengerJoin;
        $rootScope.$on('PASSENGER_ADDED', configureIsJoinable);
        $rootScope.$on('PASSENGER_DELETED', configureIsJoinable);
        $rootScope.$on('DRIVER_ADDED', configureIsJoinable);
        $rootScope.$on('DRIVER_DELETED', configureIsJoinable);
    };

    var showPassengerJoin = function(event) {
        getCurrentTravel().passenger.showAdd(event, vm.ride);
    };

    var getCurrentTravel = function() {
        if(vm.ride.is_return)
        {
            return TravelManager.getTravelBack();
        }
        return TravelManager.getTravelThere();
    };

    var configureIsJoinable = function() {
        vm.isJoinable = getCurrentTravel().isEmpty() && (vm.ride.num_of_free_seats != 0);
    };

    action();

}
'use strict';

angular.module('travelApp').directive('rideElement', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/travel/templates/ride_element.html',
        scope: {
            ride: '='
        },
        controller: RideElementController,
        controllerAs: 'element'
    };
});
'use strict'

angular.module('travelServices').factory('Ride', Ride);

Ride.$inject = ['$resource'];

function Ride($resource) {
    return $resource('/rest/1/rides/:pk/', null, {
        'getPassengers': {method: 'GET', url: '/rest/1/rides/:pk/passengers/', isArray: true},
        'update': {method: 'PUT', url: '/rest/1/rides/:pk/', isArray: false}
    });
}
'use strict';

angular.module('travelApp')
    .controller('ridesController', RidesController);

RidesController.$inject = ['$scope', '$rootScope', 'Ride', 'TravelManager'];

function RidesController($scope, $rootScope, Ride, TravelManager) {

    var vm = this;
    vm.travel = TravelManager;
    vm.there = [];
    vm.back = [];

    var activate = function() {
        listRides();
        $scope.showPassengerJoin = showPassengerJoin;
        $rootScope.$on('PASSENGER_DELETED', onPassengerDeleted);
        $rootScope.$on('PASSENGER_ADDED', onPassengerAdded);
    }

    var showPassengerJoin = function(ev, ride) {
        TravelManager.showManagePassengerDialog(ev, ride);
    };

    var onPassengerAdded = function(event, passenger) {
        addPassengerToCurrentPassengers(passenger);
    };

    var addPassengerToCurrentPassengers = function(passenger) {
        var ride = getRideByPk(passenger.ride.pk);
        ride.num_of_free_seats--;
    };

    var getRideByPk = function(ride_pk) {
        for (var i = 0; i < rides.length; i++) {
            if (rides[i].pk == ride_pk) {
                return rides[i];
            }
        }
    };

    var onPassengerDeleted = function(event, passenger) {
        deletePassengerFromCurrentPassengers(passenger);
    };

    var deletePassengerFromCurrentPassengers = function(passenger) {
        var ride = getRideByPk(passenger.ride.pk);
        ride.num_of_free_seats++;
    };

    var rides = [];

    var listRides = function() {
        Ride.query(function(response) {
            rides = response;
            vm.there = getRidesThere();
            vm.back = getRidesBack();
        });
    };

    var getRidesThere = function() {
        return rides.filter(function(ride){
            return !ride.is_return;
        });
    };

    var getRidesBack = function() {
        return rides.filter(function(ride){
            return ride.is_return;
        });
    };

    activate();

}
"use strict";

angular.module('travelApp')
    .controller('timepickerElementController', TimePickerElementController);

TimePickerElementController.$inject = ['$scope'];

function TimePickerElementController($scope) {

    var vm = this;
    $scope.vm = vm;
    vm.time = {
        hour: '00',
        min: '00',
        getHours: function() {
           var hours = [];
           for (var i = 0; i < 24; i++)
           {
                hours.push(numberToZeroPaddedString(i));
           }
           return hours;
        },
        getMinutes: function() {
           var mins = [];
           for (var i = 0; i < 60; i++)
           {
                mins.push(numberToZeroPaddedString(i));
           }
           return mins;
        },
        getTime: function() {
            return this.hour + ':' + this.min;
        }
    };
    vm.date = new Date();
    vm.getDateTime = null;

    var action = function() {
       initDateTimes();
       vm.getDateTime = getDateTime;
    };

    $scope.$watch('vm.time.hour', function() {
        emitNewDateTime();
    }, true);

    $scope.$watch('vm.time.min', function() {
        emitNewDateTime();
    }, true);

    $scope.$watch('vm.date', function() {
        emitNewDateTime();
    }, true);

    var emitNewDateTime = function() {
        $scope.$emit('DATETIME_CHANGED', {id: 1, datetime: vm.getDateTime()});
    };

    var initDateTimes = function() {
        if (!('datetime' in $scope))
        {
            return;
        }
        if ($scope.datetime == null)
        {
            return;
        }
        processInputDateTime($scope.datetime);
    };

    var processInputDateTime = function(datetime) {
        var date = new Date(datetime),
            year = date.getUTCFullYear(),
            month = date.getUTCMonth(),
            day = date.getUTCDate(),
            hour = date.getUTCHours(),
            minute = date.getUTCMinutes();
        vm.date = new Date(Date.UTC(year, month, day));
        vm.time.hour = hour;
        vm.time.min = minute;
    };

    var getDateTime = function() {
        return vm.date.getUTCFullYear()
            + '-'
            + numberToZeroPaddedString(vm.date.getUTCMonth()+1)
            + '-'
            + numberToZeroPaddedString(vm.date.getUTCDate())
            + 'T'
            + vm.time.getTime();
    };

    var numberToZeroPaddedString = function(n) {
        if (n < 10)
        {
            return '0' + n.toString();
        }

        return n.toString();
    };

    action();
}
'use strict';

angular.module('travelApp').directive('timepickerElement', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/travel/templates/timepicker_element.html',
        scope: {
            datetime: '=',
            id: '='
        },
        controller: TimePickerElementController,
        controllerAs: 'timepicker'
    };
});
'use strict';

angular.module('travelApp')
    .controller('travelElementController', TravelElementController);

TravelElementController.$inject = ['$rootScope', '$scope', '$mdDialog', 'TravelManager'];

function TravelElementController($rootScope, $scope, $mdDialog, TravelManager) {

    var vm = this;
    vm.object = null;
    vm.ride = null;
    vm.remove = null;
    vm.modify = null;

    var action = function() {
        var traveller = getTravellerByDirection($scope.direction);
        vm.object = getObject(traveller);
        vm.ride = vm.object.getRide();
        vm.remove = showElementRemove;
        vm.modify = modifyElement;
        $rootScope.$on('PASSENGER_DELETED', onPassengerDeleted);
        $rootScope.$on('PASSENGER_ADDED', onPassengerAdded);
        $rootScope.$on('DRIVER_DELETED', onDriverDeleted);
    };

    var onPassengerAdded = function () {
        action();
    };

    var onPassengerDeleted = function (event, passenger) {
        if(vm.ride == null)
        {
            return;
        }
        if(isTheSameDirection(vm.ride, passenger.ride))
        {
            removeModel();
        }
    };

    var isTheSameDirection = function (r1, r2) {
        return r1.is_return === r2.is_return;
    };

    var removeModel = function() {
        vm.object.model = null;
        vm.ride = null;
    };

    var onDriverDeleted = function(event, driver) {
        if(vm.ride == null)
         {
            return;
         }
        if(isTheSameDirection(vm.ride, driver))
        {
            removeModel();
        }
    };

    var showElementRemove = function(event) {
        var confirm = null;
        if (getTravellerByDirection($scope.direction).isDriving())
        {
            confirm = getConfirmDialogWithTitle(event,
                'Biztos vagy benne, hogy torolni szeretned a jarmuved?');
        }
        else
        {
            confirm = getConfirmDialogWithTitle(event,
                'Biztos vagy benne, hogy torolni szeretned a magad az utaslistarol?');
        }

        $mdDialog.show(confirm).then(removeElement);
    };

    var getConfirmDialogWithTitle = function(event, title) {
        return $mdDialog.confirm()
            .title(title)
            .targetEvent(event)
            .ok('Igen')
            .cancel('Megse');
    };

    var removeElement = function() {
        vm.object.remove();
    };

    var modifyElement = function(event) {
        vm.object.showModify(event);
    };

    var getTravellerByDirection = function(direction) {
        if (direction === 'there')
        {
            return TravelManager.getTravelThere();
        }
        else if (direction === 'back')
        {
            return TravelManager.getTravelBack();
        }
    }

//TODO think this over
    var getObject = function(traveller) {
        if (traveller.isDriving())
        {
            return traveller.driver;
        }
        else
        {
            return traveller.passenger;
        }
    };

    action();
}
'use strict';

angular.module('travelApp').directive('travelElement', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/travel/templates/travel_element.html',
        scope: {
            direction: '=',
        },
        controller: TravelElementController,
        controllerAs: 'element'
    };
});
angular.module('travelServices').factory('TravelManager',
    ['$mdDialog', 'Travel', TravelManager]);

TravelManager.$inject = ['$mdDialog', 'Travel'];

function TravelManager($mdDialog, Travel) {

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
'use strict'

angular.module('travelServices').factory('TravelUser', TravelUser);

TravelUser.$inject = ['$resource'];

function TravelUser($resource) {
    return $resource('/rest/1/travel_users/:pk', null, {
        'getMe': {method: 'GET', url: '/rest/1/travel_users/me/', isArray: false}
    });
}
'use strict';

angular.module('travelApp')
    .controller('travelController', TravelController);

TravelController.$inject = ['TravelUser', 'TravelManager'];

function TravelController(TravelUser, TravelManager) {

    var vm = this;
    vm.me = null;
    vm.there = TravelManager.getTravelThere();
    vm.back = TravelManager.getTravelBack();

    var action = function() {
        TravelUser.getMe(onGetMe);
    };

    var onGetMe = function(me){
        vm.me = me;
        initTravels();
    }

    var initTravels = function() {
        for (var i = 0; i < vm.me.driven_rides.length; i++)
        {
            var ride = vm.me.driven_rides[i];
            TravelManager.addDriver(ride);
        }
        for (var i = 0; i < vm.me.passenger_of_rides.length; i++)
        {
            var passenger = vm.me.passenger_of_rides[i];
            TravelManager.addPassenger(passenger);
        }
    };

    action();
};
'use strict'

angular.module('travelServices').factory('Travel',
    ['$rootScope', 'PassengerObject', 'DriverObject', Travel]);

Travel.$inject = ['$rootScope', 'PassengerObject', 'DriverObject'];

function Travel($rootScope, PassengerObject, DriverObject) {

    var travel = {
        passenger: angular.copy(PassengerObject.passenger),
        driver: angular.copy(DriverObject.driver),
        isDriving: function() {
            return this.passenger.model == null;
        },
        isEmpty: function() {
            if(this.isDriving())
            {
                return (this.driver.model == null);
            }
            else
            {
                return (this.passenger.model == null);
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
