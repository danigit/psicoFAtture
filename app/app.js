(function () {
    'use strict';

    let app = angular.module('main', ['ngRoute', 'ngMaterial', 'ngMessages']);

    app.config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: './components/login.html',
                controller: 'LoginController'})
            .when('/home',{
                templateUrl: './components/home.html',
                controller: 'HomeController'})
            .otherwise({
                template: '404'
            })
    });

    app.controller('LoginController', LoginController);
    app.service('LoginService', LoginService);

    LoginController.$inject = ["$scope", '$location', 'LoginService'];
    function LoginController($scope, $location,  LoginService) {
        $scope.email = '';
        $scope.password = '';

        $scope.login = function(){
            let promise = LoginService.login($scope.email, $scope.password);
            promise.then(
                function (response) {
                    if (response.data.response) {
                        $location.path('/home');
                    }
                }
            ).catch(
                function (response) {
                    //TODO handle the error
                    console.log(response);
                }
            )
        }
    }

    LoginService.$inject = ['$http'];
    function LoginService($http) {
        let service = this;

        service.login = function(email, password) {
            return $http({
                method: 'POST',
                url   : 'http://localhost/psicoFatture/php/ajax/login.php',
                params: {email: email, password: password},
            });
        }
    }
})();