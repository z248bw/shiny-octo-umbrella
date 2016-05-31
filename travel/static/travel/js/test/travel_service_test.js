describe('Given a Travel instance', function() {

    var mockDialog = {};
    var mockPassenger = {
        remove: function(pk, onSuccess) {
            onSuccess();
        }
    };
    beforeEach(module("travelServices", function ($provide) {
        $provide.value("$mdDialog", mockDialog);
        $provide.value("Passenger", mockPassenger);
    }));

    var createPassenger = function(pk, isReturn) {
        return {
            pk: pk,
            ride: {
                is_return: isReturn
            }
        };
    };

    it('a passenger there can be added and only Travel.there will be set', inject(function(Travel) {
        Travel.addPassenger(Travel, createPassenger('1', false));
        expect(Travel.there.passenger.model.pk).toBe('1');
        expect(Travel.there.driver.model).toBe(null);
        expect(Travel.back.passenger.model).toBe(null);
        expect(Travel.back.driver.model).toBe(null);
    }));

    it('when a passenger is added it will be emit on the rootscope',
        inject(function($rootScope, Travel) {
        var passenger = createPassenger('1', false);

        spyOn($rootScope, "$emit")
        Travel.addPassenger(Travel, passenger);
        expect($rootScope.$emit).toHaveBeenCalledWith("PASSENGER_ADDED", passenger);
    }));

    it('a passenger there and back can be added', inject(function(Travel) {
        Travel.addPassenger(Travel, createPassenger('1', false));
        Travel.addPassenger(Travel, createPassenger('2', true));
        expect(Travel.there.passenger.model.pk).toBe('1');
        expect(Travel.there.driver.model).toBe(null);
        expect(Travel.back.passenger.model.pk).toBe('2');
        expect(Travel.back.driver.model).toBe(null);
    }));

    it('a passenger there can be updated and only the Travel.there will be changed',
        inject(function(Travel) {
        Travel.addPassenger(Travel, createPassenger('1', false));
        Travel.addPassenger(Travel, createPassenger('2', false));
        expect(Travel.there.passenger.model.pk).toBe('2');
        expect(Travel.there.driver.model).toBe(null);
        expect(Travel.back.passenger.model).toBe(null);
        expect(Travel.back.driver.model).toBe(null);
    }));

    it('when a passenger is deleted it will be emit on the rootscope',
        inject(function($rootScope, Travel) {
        var passenger = createPassenger('1', false);
        Travel.addPassenger(Travel, passenger);

        spyOn($rootScope, "$emit")
        Travel.there.passenger.remove(Travel.there.passenger);
        expect($rootScope.$emit).toHaveBeenCalledWith("PASSENGER_DELETED", passenger);
    }));

    it('a passenger can be deleted and then added', inject(function(Travel) {
        Travel.addPassenger(Travel, createPassenger('1', false));
        Travel.there.passenger.remove(Travel.there.passenger);
        Travel.addPassenger(Travel, createPassenger('2', false));
        expect(Travel.there.passenger.model.pk).toBe('2');
        expect(Travel.there.driver.model).toBe(null);
        expect(Travel.back.passenger.model).toBe(null);
        expect(Travel.back.driver.model).toBe(null);
    }));

    it('a isDriving returns false for passenger', inject(function(Travel) {
        Travel.addPassenger(Travel, createPassenger('1', false));
        expect(Travel.there.isDriving()).toBe(false);
    }));

});