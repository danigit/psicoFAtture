(function () {
    'use strict';

    let app = angular.module('main', ['ngRoute']);

    app.config(function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: './components/home.html',
            controller: 'homeController'
        }).when('/login', {
            templateUrl: './components/login.html',
            controller: 'loginController'
        })
        .otherwise({
            template: '404'
        })
    });

    app.controller('homeController', function ($scope, $location) {
        $scope.login = function () {
            let username = $scope.username;
            let password = $scope.password;
        }
    });

    app.controller('loginController', function ($scope) {

    })
})();