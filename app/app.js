'use strict';

let app = angular.module('myApp', []);

app.controller('myCtrl', function ($scope) {
    $scope.cars = [
        'acura', 'audi', 'BMW'
    ];
});