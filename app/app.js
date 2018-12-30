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
    app.controller('HomeNavController', HomeNavController);
    app.controller('HomeController', HomeController);
    app.controller('LastInvoicesController', LastInvoicesController);
    app.service('LoginService', LoginService);
    app.service('HomeService', HomeService);

    /**
     * Function that handle the login page
     * @type {string[]}
     */
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

    /**
     * Function that handle the navbar
     * @type {string[]}
     */
    HomeNavController.$inject = ['$scope'];
    function HomeNavController($scope){

    }

    /**
     * Function that handle the home page main controller
     * @type {string[]}
     */
    HomeController.$inject = ['$scope', 'HomeService'];
    function HomeController($scope, HomeService){
    }

    /**
     * Function that stores the last 10 invoices
     * @type {string[]}
     */
    LastInvoicesController.$inject = ['$scope', 'HomeService'];
    function LastInvoicesController($scope, HomeService){
        $scope.lastInvoices = [];

        let promise = HomeService.getLastInvoces();

        promise.then(
            function (response) {
                if (response.data.response){
                    $scope.lastInvoices = response.data.result;
                    console.log($scope.lastInvoices);
                }
            }
        )
    }

    /**
     * Service that connects with the database and control the validity of the login credentials
     * @type {string[]}
     */
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

    /**
     * Service that retrieve the last 10 linvoices
     * @type {string[]}
     */
    HomeService.$inject = ['$http'];
    function HomeService($http) {
        let service = this;

        service.getLastInvoces = function () {
            return $http({
                method: 'GET',
                url: 'http://localhost/psicoFatture/php/ajax/get_last_invoices.php'
            });
        }
    }
})();