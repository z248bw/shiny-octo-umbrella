'use strict';

describe('Given a Utils', function() {

    beforeEach(module('TravelServices'));
    beforeEach(module('TestUtils'));

    var Utils,
        TestUtils;
    beforeEach(function() {
        angular.mock.inject(function ($injector) {
            Utils = $injector.get('Utils');
            TestUtils = $injector.get('TestUtils');
        });
    });

    it('removeElement from empty array',
        function() {
            var elements = [],
                element = {pk: '1'};
            Utils.removeElementFromArray(element, elements);
            expect(elements.length).toBe(0);
        }
    );

    it('removeElement from array which does not contain that element',
        function() {
            var elements = [{pk: 'x'}],
                element = {pk: '1'};
            expect(elements.length).toBe(1);
            Utils.removeElementFromArray(element, elements);
            expect(elements.length).toBe(1);
        }
    );

    it('removeElement from array which contains that element',
        function() {
            var elements = [{pk: '1'}],
                element = {pk: '1'};
            expect(elements.length).toBe(1);
            Utils.removeElementFromArray(element, elements);
            expect(elements.length).toBe(0);
        }
    );

    it('removeElement from array which contains that element multiple times',
        function() {
            var elements = [{pk: '1'}, {pk: '1'}],
                element = {pk: '1'};
            expect(elements.length).toBe(2);
            Utils.removeElementFromArray(element, elements);
            expect(elements.length).toBe(0);
        }
    );

    it('removeElement from array which contains that element as last element',
        function() {
            var elements = [{pk: 'x'}, {pk: '1'}],
                element = {pk: '1'};
            expect(elements.length).toBe(2);
            Utils.removeElementFromArray(element, elements);
            expect(elements.length).toBe(1);
            expect(elements[0].pk).toBe('x');
        }
    );

    it('removeElement from array which contains that element as first element',
        function() {
            var elements = [{pk: '1'}, {pk: 'x'}],
                element = {pk: '1'};
            expect(elements.length).toBe(2);
            Utils.removeElementFromArray(element, elements);
            expect(elements.length).toBe(1);
            expect(elements[0].pk).toBe('x');
        }
    );

    it('removeElement from array which contains that element as middle element',
        function() {
            var elements = [{pk: 'x'}, {pk: '1'}, {pk: 'x'}],
                element = {pk: '1'};
            expect(elements.length).toBe(3);
            Utils.removeElementFromArray(element, elements);
            expect(elements.length).toBe(2);
            expect(elements[0].pk).toBe('x');
            expect(elements[1].pk).toBe('x');
        }
    );
});