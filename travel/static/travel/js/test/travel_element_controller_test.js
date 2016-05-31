describe('Given a Travel element', function() {

    var mockDialog = {};
    var mockPassenger = {
        remove: function(pk, callback) {
            callback();
        }
    };
    beforeEach(module("travelServices", function ($provide) {
        $provide.value("$mdDialog", mockDialog);
        $provide.value("Passenger", mockPassenger);
    }));

    beforeEach(module('travelApp'));

    var createPassenger = function(pk, isReturn) {
        return {
            pk: pk,
            ride: {
                pk: '1',
                is_return: isReturn
            }
        };
    };

     var createPassengerThere = function(pk) {
        return createPassenger(pk, false);
    };

    var createPassengerBack = function(pk) {
        return createPassenger(pk, true);
    };

    it('travelElementController instantiated as "there" will set the object to null when Travel.there is null',
        inject(function($controller, Travel) {
            var scope = {direction: 'there'};

            var ctrl = $controller('travelElementController', {$scope: scope});

            expect(ctrl.object.model).toBe(null);
        })
    );

    it('travelElementController instantiated as "there" will set the object to Travel.there',
        inject(function($controller, Travel) {
            var scope = {direction: 'there'};
            Travel.addPassenger(Travel, createPassengerThere('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});

            expect(ctrl.object.model.pk).toBe('1');
        })
    );

    it('travelElementController instantiated as "there" will set the ride object',
        inject(function($controller, Travel) {
            var scope = {direction: 'there'};
            Travel.addPassenger(Travel, createPassengerThere('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});

            expect(ctrl.ride.pk).toBe('1');
        })
    );

    it('travelElementController instantiated as "back" will set the object to Travel.back',
        inject(function($controller, Travel) {
            var scope = {direction: 'back'};
            Travel.addPassenger(Travel, createPassengerBack('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});

            expect(ctrl.object.model.pk).toBe('1');
        })
    );

     it('travelElementController will not set the object and ride if the direction of the new passenger is not the same',
        inject(function($controller, Travel) {
            var scope = {direction: 'there'};
            var passenger = createPassengerBack('1');
            Travel.addPassenger(Travel, passenger);

            var ctrl = $controller('travelElementController', {$scope: scope});

            expect(ctrl.object.model).toBe(null);
            expect(ctrl.ride).toBe(null);
        })
    );

    it('travelElementController will set the object.model to null if the passenger is deleted',
        inject(function($controller, Travel) {
            var scope = {direction: 'there'};
            Travel.addPassenger(Travel, createPassengerThere('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});
            Travel.there.passenger.remove(Travel.there.passenger);

            expect(ctrl.object.model).toBe(null);
        })
    );

    it('travelElementController can remove the element',
        inject(function($controller, Travel) {
            var scope = {direction: 'there'};
            Travel.addPassenger(Travel, createPassengerThere('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});
            ctrl.remove();

            expect(ctrl.object.model).toBe(null);
        })
    );

    it('travelElementController will do nothing if another passenger is deleted',
        inject(function($controller, Travel) {
            var scope = {direction: 'there'};
            Travel.addPassenger(Travel, createPassengerThere('1'));
            Travel.addPassenger(Travel, createPassengerBack('2'));

            var ctrl = $controller('travelElementController', {$scope: scope});
            Travel.back.passenger.remove(Travel.back.passenger);

            expect(ctrl.object.model.pk).toBe('1');
        })
    );

    it('travelElementController will set the ride to null if the passenger is deleted',
        inject(function($controller, Travel) {
            var scope = {direction: 'there'};
            Travel.addPassenger(Travel, createPassengerThere('1'));

            var ctrl = $controller('travelElementController', {$scope: scope});
            Travel.there.passenger.remove(Travel.there.passenger);

            expect(ctrl.ride).toBe(null);
        })
    );

    it('travelElementController will set the object and ride if a new passenger is added',
        inject(function($controller, Travel) {
            var scope = {direction: 'there'};
            var passenger = createPassengerThere('1');

            var ctrl = $controller('travelElementController', {$scope: scope});
            Travel.addPassenger(Travel, passenger);

            expect(ctrl.object.model.pk).toBe('1');
            expect(ctrl.ride.pk).toBe('1');
        })
    );

    it('travelElementController will not set the object and ride if the direction of the new passenger does not match',
        inject(function($controller, Travel) {
            var scope = {direction: 'there'};
            var passenger = createPassengerBack('1');

            var ctrl = $controller('travelElementController', {$scope: scope});
            Travel.addPassenger(Travel, passenger);

            expect(ctrl.object.model).toBe(null);
            expect(ctrl.ride).toBe(null);
        })
    );

});