'use strict';

describe('Given a ManageRideController', function() {

    beforeEach(module('travelApp'));
    beforeEach(module('travelServices'));
    beforeEach(module('testUtils'));

    var $controller,
        $scope,
        $httpBackend,
        $rootScope,
        TestUtils,
        routeParams;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $controller = $injector.get('$controller');
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            TestUtils = $injector.get('TestUtils');
        });

        $scope = $rootScope.$new();
        routeParams = {direction: 'there'};
    });

    var acceptDialogDecorator = function(scope, decorated) {
        var deferred = TestUtils.getMdDialogShowResponseDeferred();
        decorated();
        TestUtils.resolveDeferred(scope, deferred);
    }

    it('on init the details of the current ride should be get from TravelManager and passengers should be fetched',
        inject(function(TravelManager) {
            var currentRide = TestUtils.createRideThere('1'),
                passengers = [];
            TravelManager.addDriver(currentRide);
            $httpBackend.expectGET('/rest/1/rides/1/passengers/').respond(passengers);

            var ctrl = $controller('manageRideController', {$scope: $scope, $routeParams: routeParams});
            $httpBackend.flush();

            expect(ctrl.driver.model.pk).toBe('1');
            expect(ctrl.passengers.length).toBe(0);
        })
    );

    it('if the ride is null the passengers should not be fetched',
        inject(function(Ride) {
            spyOn(Ride, 'getPassengers');

            var ctrl = $controller('manageRideController', {$scope: $scope, $routeParams: routeParams});

            expect(Ride.getPassengers).not.toHaveBeenCalled();
        })
    );

     it('if the ride is null the direction should be set according to the routeParams',
        inject(function(TravelManager) {
            var ctrl = $controller('manageRideController', {$scope: $scope, $routeParams: routeParams});

            expect(TravelManager.getDriverThere().model.is_return).toBe(false);
        })
    );

    it('if the direction is not provided init should throw an error',
        function() {
            expect(function(){$controller('manageRideController', {$scope: $scope})})
                .toThrow(new Error('Direction not specified'));
        }
    );

    it('if the ride was null it should create a new one on the backend on save',
        function() {
            var ctrl = $controller('manageRideController', {$scope: $scope, $routeParams: routeParams});

            $httpBackend.expectPOST('/rest/1/rides/').respond({});

            acceptDialogDecorator($scope, ctrl.showDriverSaveDialog);

            $httpBackend.flush();
        }
    );

    it('if the ride was not null it should update the existing one on save',
        inject(function(TravelManager) {
            var currentRide = TestUtils.createRideThere('1'),
                passengers = [];

            TravelManager.addDriver(currentRide);
            $httpBackend.expectGET('/rest/1/rides/1/passengers/').respond(passengers);

            var ctrl = $controller('manageRideController', {$scope: $scope, $routeParams: routeParams});
            $httpBackend.flush();

            $httpBackend.expectPUT('/rest/1/rides/1/').respond(currentRide);
            acceptDialogDecorator($scope, ctrl.showDriverSaveDialog);

            $httpBackend.flush();
        })
    );

    it('deleting a ride should delete it on the backend as well',
        inject(function(TravelManager) {
            var currentRide = TestUtils.createRideThere('1'),
                passengers = [];

            TravelManager.addDriver(currentRide);
            $httpBackend.expectGET('/rest/1/rides/1/passengers/').respond(passengers);
            var ctrl = $controller('manageRideController', {$scope: $scope, $routeParams: routeParams});
            $httpBackend.flush();

            $httpBackend.expectDELETE('/rest/1/rides/1/').respond({});

            acceptDialogDecorator($scope, ctrl.showDriverDeleteDialog);

            $httpBackend.flush();
        })
    );

   it('when the DATETIME_CHANGED event fires it should update the model accordingly',
        function() {
            var ctrl = $controller('manageRideController', {$scope: $scope, $routeParams: routeParams});

            $rootScope.$broadcast("DATETIME_CHANGED", {id: 1, datetime: '2016-05-16T20:00'});

            expect(ctrl.driver.model.start_time).toBe('2016-05-16T20:00');
        }
    );

});