'use strict';

describe('Given a ManageRideController', function() {

    beforeEach(module('TravelApp'));
    beforeEach(module('TravelServices'));
    beforeEach(module('TestUtils'));

    var $controller,
        $scope,
        $rootScope,
        TestUtils,
        TravelManager;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $controller = $injector.get('$controller');
            $rootScope = $injector.get('$rootScope');
            TestUtils = $injector.get('TestUtils');
            TravelManager = $injector.get('TravelManager');
        });

        $scope = $rootScope.$new();
    });

    it('when the join button on the dialog is not pressed nothing happens',
        function() {
            var passengerModel = TravelManager.getModelThere();
//            TODO baaaaaaad
            passengerModel = {ride: TestUtils.createRideThere('1')};
            var ctrl = $controller('PassengerJoinController', {$scope: $scope, passengerModel: passengerModel});

            expect(TravelManager.getModelThere()).toBe(null);
        }
    );

});