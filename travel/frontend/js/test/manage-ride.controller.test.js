'use strict';

describe('Given a ManageRideController', function() {

    beforeEach(module('TravelApp'));
    beforeEach(module('TravelServices'));
    beforeEach(module('TestUtils'));

    var $controller,
        $scope,
        $httpBackend,
        $rootScope,
        TestUtils,
        routeParams,
        TravelManager;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $controller = $injector.get('$controller');
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            TestUtils = $injector.get('TestUtils');
            TravelManager = $injector.get('TravelManager');
        });

        $scope = $rootScope.$new();
        routeParams = {direction: 'there'};
    });

    var acceptDialogDecorator = function(scope, decorated) {
        var deferred = TestUtils.getMdDialogShowResponseDeferred();
        decorated();
        TestUtils.resolveDeferred(scope, deferred);
    }

    var createManageRideControllerThere = function(ride, passengers) {
        TravelManager.addDriver(ride);
        $httpBackend.expectGET('/rest/1/rides/' + ride.pk +'/passengers/').respond(passengers);
        var ctrl = $controller('ManageRideController', {$scope: $scope, $routeParams: routeParams});
        $httpBackend.flush();
        return ctrl;
    }

    it('on init the details of the current ride should be get from TravelManager and passengers should be fetched',
        function() {
            var passengers = [],
                ride = TestUtils.createRideThere('1'),
                ctrl = createManageRideControllerThere(ride, passengers);

            expect(ctrl.driver.model.pk).toBe('1');
            expect(ctrl.passengers.length).toBe(0);
        }
    );

    it('if the ride is null the passengers should not be fetched',
        inject(function(Ride) {
            spyOn(Ride, 'getPassengers');

            var ctrl = $controller('ManageRideController', {$scope: $scope, $routeParams: routeParams});

            expect(Ride.getPassengers).not.toHaveBeenCalled();
        })
    );

     it('if the ride is null the direction should be set according to the routeParams',
        function() {
            var ctrl = $controller('ManageRideController', {$scope: $scope, $routeParams: routeParams});

            expect(TravelManager.getDriverThere().model.is_return).toBe(false);
        }
    );

    it('if the direction is not provided init should throw an error',
        function() {
            expect(function(){$controller('ManageRideController', {$scope: $scope})})
                .toThrow(new Error('Direction not specified'));
        }
    );

    it('if the ride was null it should create a new one on the backend on save',
        function() {
            var ctrl = $controller('ManageRideController', {$scope: $scope, $routeParams: routeParams});

            $httpBackend.expectPOST('/rest/1/rides/').respond({});

            acceptDialogDecorator($scope, ctrl.showDriverSaveDialog);

            $httpBackend.flush();
        }
    );

    it('if the ride was not null it should update the existing one on save',
        function() {
            var passengers = [],
                ride = TestUtils.createRideThere('1'),
                ctrl = createManageRideControllerThere(ride, passengers);

            $httpBackend.expectPUT('/rest/1/rides/1/').respond(ride);
            acceptDialogDecorator($scope, ctrl.showDriverSaveDialog);

            $httpBackend.flush();
        }
    );

    it('deleting a ride should delete it on the backend as well',
        function() {
            var passengers = [],
                ride = TestUtils.createRideThere('1'),
                ctrl = createManageRideControllerThere(ride, passengers);

            $httpBackend.expectDELETE('/rest/1/rides/1/').respond({});

            acceptDialogDecorator($scope, ctrl.showDriverDeleteDialog);

            $httpBackend.flush();
        }
    );

   it('when the DATETIME_CHANGED event fires it should update the model accordingly',
        function() {
            var ctrl = $controller('ManageRideController', {$scope: $scope, $routeParams: routeParams});

            $rootScope.$broadcast("DATETIME_CHANGED", {id: 1, datetime: '2016-05-16T20:00'});

            expect(ctrl.driver.model.start_time).toBe('2016-05-16T20:00');
        }
    );

    it('confirming the passenger delete dialog should fire a passenger delete request',
        function() {
            var passengers = [TestUtils.createPassengerThere('1')],
                ride = TestUtils.createRideThere('1'),
                ctrl = createManageRideControllerThere(ride, passengers);

            ctrl.passengers[0].selected = true;
            $httpBackend.expectDELETE('/rest/1/passengers/1/').respond({});

            acceptDialogDecorator($scope, ctrl.showPassengerDeleteDialog);

            $httpBackend.flush();
        }
    );

    it('selecting multiple passengers for delete and confirming the dialog should create multiple delete requests',
        function() {
            var passengers = [
                    TestUtils.createPassengerThere('1'),
                    TestUtils.createPassengerThere('2'),
                    TestUtils.createPassengerThere('3')
                ],
                ride = TestUtils.createRideThere('1'),
                ctrl = createManageRideControllerThere(ride, passengers);

            ctrl.passengers[0].selected = true;
            ctrl.passengers[1].selected = true;
            $httpBackend.expectDELETE('/rest/1/passengers/1/').respond({});
            $httpBackend.expectDELETE('/rest/1/passengers/2/').respond({});

            acceptDialogDecorator($scope, ctrl.showPassengerDeleteDialog);

            $httpBackend.flush();
        }
    );

    it('after successful passenger delete the deleted passenger should be removed from the passenger list',
        function() {
            var passengers = [
                    TestUtils.createPassengerThere('1'),
                    TestUtils.createPassengerThere('2'),
                    TestUtils.createPassengerThere('3')
                ],
                ride = TestUtils.createRideThere('1'),
                ctrl = createManageRideControllerThere(ride, passengers);

            ctrl.passengers[1].selected = true;
            $httpBackend.expectDELETE('/rest/1/passengers/2/').respond({});

            acceptDialogDecorator($scope, ctrl.showPassengerDeleteDialog);

            $httpBackend.flush();

            expect(ctrl.passengers.length).toBe(2);
        }
    );

    it('after deleting multiple passengers the deleted passengers should be removed from the passenger list',
        function() {
            var passengers = [
                    TestUtils.createPassengerThere('1'),
                    TestUtils.createPassengerThere('2'),
                    TestUtils.createPassengerThere('3')
                ],
                ride = TestUtils.createRideThere('1'),
                ctrl = createManageRideControllerThere(ride, passengers);

            ctrl.passengers[0].selected = true;
            ctrl.passengers[1].selected = true;
            $httpBackend.expectDELETE('/rest/1/passengers/1/').respond({});
            $httpBackend.expectDELETE('/rest/1/passengers/2/').respond({});

            acceptDialogDecorator($scope, ctrl.showPassengerDeleteDialog);

            $httpBackend.flush();

            expect(ctrl.passengers[0].pk).toBe('3');
        }
    );

});