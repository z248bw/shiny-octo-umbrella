'use strict';

describe('Given a RidesController', function() {

    beforeEach(module('travelApp'));
    beforeEach(module('travelServices'));
    beforeEach(module('testUtils'));

    var $httpBackend;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
        });
    });

    it('when ride query contains empty lists nothing will be put on the there and back list',
        inject(function($controller, Travel, TestUtils) {
            var scope = {};
            $httpBackend.expectGET('/rest/1/rides/').respond([]);

            var ctrl = $controller('ridesController', {$scope: scope});
            $httpBackend.flush();

            expect(ctrl.there.length).toBe(0);
            expect(ctrl.back.length).toBe(0);
        })
    );

    it('when ride query contains one ride there it will be put to the there list',
        inject(function($controller, Travel, TestUtils) {
            var scope = {};
            $httpBackend.expectGET('/rest/1/rides/').respond([TestUtils.createRideThere('1')]);

            var ctrl = $controller('ridesController', {$scope: scope});
            $httpBackend.flush();

            expect(ctrl.there[0].pk).toBe('1');
        })
    );

    it('when ride query contains two rides there they will be put to the there list',
        inject(function($controller, Travel, TestUtils) {
            var scope = {};
            $httpBackend.expectGET('/rest/1/rides/').respond(
                [TestUtils.createRideThere('1'), TestUtils.createRideThere('2')]
            );

            var ctrl = $controller('ridesController', {$scope: scope});
            $httpBackend.flush();

            expect(ctrl.there[0].pk).toBe('1');
            expect(ctrl.there[1].pk).toBe('2');
        })
    );

    it('when ride query contains two rides there and back they will be put to the there and back list',
        inject(function($controller, Travel, TestUtils) {
            var scope = {};
            $httpBackend.expectGET('/rest/1/rides/').respond(
                [TestUtils.createRideThere('1'), TestUtils.createRideBack('2')]
            );

            var ctrl = $controller('ridesController', {$scope: scope});
            $httpBackend.flush();

            expect(ctrl.there[0].pk).toBe('1');
            expect(ctrl.back[0].pk).toBe('2');
        })
    );

    it('if a passenger is added his ride will have one less free seats',
        inject(function($controller, Travel, TestUtils) {
            var scope = {};
            $httpBackend.expectGET('/rest/1/rides/').respond(
                [TestUtils.createRideThere('1')]
            );
            var ctrl = $controller('ridesController', {$scope: scope});
            $httpBackend.flush();
            expect(ctrl.there[0].num_of_free_seats).toBe(1);

            Travel.addPassenger(TestUtils.createPassengerThere('1'));

            expect(ctrl.there[0].num_of_free_seats).toBe(0);
        })
    );

    it('if a passenger is deleted his ride will have one more free seats',
        inject(function($controller, Travel, TestUtils) {
            var scope = {};
            $httpBackend.expectGET('/rest/1/rides/').respond(
                [TestUtils.createRideThere('1')]
            );
            var ctrl = $controller('ridesController', {$scope: scope});
            $httpBackend.flush();
            Travel.there.passenger.model = TestUtils.createPassengerThere('1');

            $httpBackend.expectDELETE('/rest/1/passengers/1/').respond({});
            Travel.there.passenger.remove();
            $httpBackend.flush();

            expect(ctrl.there[0].num_of_free_seats).toBe(2);
        })
    );

});