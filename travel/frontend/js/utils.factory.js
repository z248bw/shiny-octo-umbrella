(function () {
    'use strict';

    angular.module('TravelServices').factory('Utils', Utils);

    function Utils() {
        return {
            removeElementFromArray: removeElement
        };

        function removeElement(element, elements) {
            var i = getIndexOfElement(element, elements, 0);
            while(i < elements.length)
            {
                if (i > -1)
                {
                    elements.splice(i, 1);
                    i = getIndexOfElement(element, elements, i);
                }
                else
                {
                    return;
                }
            }
         }

        function getIndexOfElement(element, elements, start) {
            for(var i = start; i < elements.length; i++)
            {
                if (elements[i].pk === element.pk)
                {
                    return i;
                }
            }
            return -1;
        }
    }
}());