(function () {
    'use strict';

    angular.module('TravelServices')
        .factory('ProgressManager', ProgressManager);

    ProgressManager.$inject = ['$rootScope'];

    function ProgressManager($rootScope) {
        var isLoading = false,
            startCounter = 0;

       $rootScope.$on('$routeChangeStart', onLoadStart);
       $rootScope.$on('$routeChangeSuccess', onLoadFinish);
       $rootScope.$on('$routeChangeError', onLoadFinish);

        return {
            isLoading: getIsLoading,
            decorate: decorate
        };

        function getIsLoading() {
            return isLoading;
        }

        function decorate(context) {
            onLoadStart();
            context.execute().then(function(){
                onLoadFinish();
            });
        }

        function onLoadStart() {
            startCounter++;
            isLoading = true;
        }

        function onLoadFinish() {
            startCounter--;
            if(startCounter === 0)
            {
                isLoading = false;
            }
        }

    }
}());