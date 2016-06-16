'use strict';

describe('Given a ManageRideController', function() {

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

    it('on init the details of the current ride should be get from Travel and passengers should be fetched',
        inject(function($controller, Travel) {
            var scope = {},
                routeParams = {direction: 'there'},
                currentRide = TestUtils.createRideThere('1'),
                passengers = [];
            Travel.there.driver.model = currentRide;
            $httpBackend.expectGET('/rest/1/rides/1/passengers/').respond(passengers);

            var ctrl = $controller('manageRideController', {$scope: scope, $routeParams: routeParams});
            $httpBackend.flush();

            expect(ctrl.driver.model.pk).toBe('1');
            expect(ctrl.passengers.length).toBe(0);
        })
    );

    it('if the ride is null the passengers should not be fetched',
        inject(function($controller, Ride) {
            var scope = {},
                routeParams = {direction: 'there'};

            spyOn(Ride, 'getPassengers');

            var ctrl = $controller('manageRideController', {$scope: scope, $routeParams: routeParams});

            expect(Ride.getPassengers).not.toHaveBeenCalled();
        })
    );

    it('if the direction is not provided init should throw an error',
        inject(function($controller) {
            expect(function(){$controller('manageRideController', {$scope: {}})})
                .toThrow(new Error('Direction not specified'));
        })
    );

    it('if the ride was null it should create a new one on the backend on save',
        inject(function($controller, $rootScope) {
            var currentRide = {},
                routeParams = {direction: 'there'},
                passengers = [];

            var $scope = $rootScope.$new();

            var ctrl = $controller('manageRideController', {$scope: $scope, $routeParams: routeParams});

            currentRide = TestUtils.createRideThere('1');
            ctrl.driver.ride = currentRide;
            $httpBackend.expectPOST('/rest/1/rides/').respond(currentRide);

            acceptDialogDecorator($scope, ctrl.showDriverSaveDialog);

            $httpBackend.flush();
        })
    );

    it('if the ride was not null it should update the existing one on save',
        inject(function($controller, $rootScope, Travel) {
            var currentRide = TestUtils.createRideThere('1'),
                routeParams = {direction: 'there'},
                passengers = [];

            var $scope = $rootScope.$new();
            Travel.there.driver.model = currentRide;
            $httpBackend.expectGET('/rest/1/rides/1/passengers/').respond(passengers);

            var ctrl = $controller('manageRideController', {$scope: $scope, $routeParams: routeParams});
            $httpBackend.flush();

            $httpBackend.expectPUT('/rest/1/rides/').respond(currentRide);
            acceptDialogDecorator($scope, ctrl.showDriverSaveDialog);

            $httpBackend.flush();
        })
    );

    it('deleting a ride should delete it on the backend as well',
        inject(function($controller, $rootScope, Travel) {
            var currentRide = TestUtils.createRideThere('1'),
                routeParams = {direction: 'there'},
                passengers = [];

            var $scope = $rootScope.$new();
            Travel.there.driver.model = currentRide;
            $httpBackend.expectGET('/rest/1/rides/1/passengers/').respond(passengers);
            var ctrl = $controller('manageRideController', {$scope: $scope, $routeParams: routeParams});
            $httpBackend.flush();
            $httpBackend.expectDELETE('/rest/1/rides/1').respond({});

            acceptDialogDecorator($scope, ctrl.showDriverDeleteDialog);

            $httpBackend.flush();
        })
    );

});