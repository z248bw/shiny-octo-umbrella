'use strict';

describe('Given a RideDetailsController', function() {

    beforeEach(module('travelApp'));
    beforeEach(module('travelServices'));
    beforeEach(module('testUtils'));

    var $httpBackend,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            TestUtils = $injector.get('TestUtils');
        });
    });

    var acceptDialogDecorator = function(scope, decorated) {
        var deferred = TestUtils.getMdDialogShowResponseDeferred();
        decorated();
        TestUtils.resolveDeferred(scope, deferred);
    }

    it('on init the details of the current ride should be fetched',
        inject(function($controller) {
            var scope = {},
                routeParams = {pk: '1'},
                currentRide = TestUtils.createRideThere('1'),
                passengers = [];
            $httpBackend.expectGET('/rest/1/rides/1').respond(currentRide);
            $httpBackend.expectGET('/rest/1/rides/1/passengers/').respond(passengers);

            var ctrl = $controller('rideDetailsController', {$scope: scope, $routeParams: routeParams});
            $httpBackend.flush();

            expect(ctrl.ride.pk).toBe('1');
            expect(ctrl.passengers.length).toBe(0);
        })
    );

    it('if routeParams pk is undefined the fetching of the details should not be continued',
        inject(function($controller, Ride) {
            var scope = {},
                routeParams = {},
                passengers = [];

            spyOn(Ride, 'get');


            var ctrl = $controller('rideDetailsController', {$scope: scope, $routeParams: routeParams});

            expect(Ride.get).not.toHaveBeenCalled();
        })
    );

    it('if the ride was null it should create a new one on the backend on save',
        inject(function($controller, $rootScope, Ride) {
            var routeParams = {},
                currentRide = {},
                passengers = [];

            var $scope = $rootScope.$new();

            var ctrl = $controller('rideDetailsController', {$scope: $scope, $routeParams: routeParams});

            currentRide = TestUtils.createRideThere('1');
            ctrl.ride = currentRide;
            $httpBackend.expectPOST('/rest/1/rides/').respond(currentRide);

            acceptDialogDecorator($scope, ctrl.showRideSaveDialog);

            $httpBackend.flush();
        })
    );

    it('if the ride was not null it should update the existing one on save',
        inject(function($controller, $rootScope, Ride) {
            var routeParams = {pk: '1'},
                currentRide = TestUtils.createRideThere('1'),
                passengers = [];

            var $scope = $rootScope.$new();

            $httpBackend.expectGET('/rest/1/rides/1').respond(currentRide);
            $httpBackend.expectGET('/rest/1/rides/1/passengers/').respond(passengers);

            var ctrl = $controller('rideDetailsController', {$scope: $scope, $routeParams: routeParams});
            $httpBackend.flush();

            currentRide = TestUtils.createRideThere('1');
            $httpBackend.expectPUT('/rest/1/rides/').respond(currentRide);

            acceptDialogDecorator($scope, ctrl.showRideSaveDialog);

            $httpBackend.flush();
        })
    );

    it('deleting a ride should delete it on the backend as well',
        inject(function($controller, $rootScope, Ride) {
            var routeParams = {},
                currentRide = TestUtils.createRideThere('1'),
                passengers = [];

            var $scope = $rootScope.$new();

            var ctrl = $controller('rideDetailsController', {$scope: $scope, $routeParams: routeParams});
            ctrl.ride = TestUtils.createRideThere('1');
            $httpBackend.expectDELETE('/rest/1/rides/1').respond({});

            acceptDialogDecorator($scope, ctrl.showRideDeleteDialog);

            $httpBackend.flush();
        })
    );

});