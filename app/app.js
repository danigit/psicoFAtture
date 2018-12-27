(function () {
    'use strict';

    let app = angular.module('main', ['ngRoute', 'ngMaterial']);

    app.config(function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: './components/home.html',
            controller: 'homeController'
        })
        .otherwise({
            template: '404'
        })
    });

    app.controller('homeController', function ($scope, $location) {
        $scope.login = function () {
            let username = $scope.username;
            let password = $scope.password;
            $location.path('/login');
        }
    });

    app.controller('loginController', function ($scope) {

    })
})();