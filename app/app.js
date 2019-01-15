(function () {
    'use strict';

    let app = angular.module('main', ['ngRoute', 'ngMaterial', 'ngMessages']);

    app.config(function ($routeProvider, $mdDateLocaleProvider) {
        $routeProvider
            .when('/', {
                resolve: {
                    check: function ($location, LoginService) {
                        LoginService.isLogged().then(
                            function (response) {
                                if (response.data.response){
                                    $location.path('/home');
                                }
                            }
                        );
                    },
                },
                templateUrl: '../psicoFatture/components/login.html',
                controller: 'LoginController'})
            .when('/home',{
                resolve: {
                    check: function ($location, LoginService) {
                        LoginService.isLogged().then(
                            function (response) {
                                if (!response.data.response){
                                    $location.path('/');
                                }
                            }
                        );
                    },
                },
                templateUrl: '../psicoFatture/components/home.html',
                controller: 'HomeController'})
            .when('/generate-invoice', {
                resolve: {
                    check: function ($location, LoginService) {
                        LoginService.isLogged().then(
                            function (response) {
                                if (!response.data.response){
                                    $location.path('/');
                                }
                            }
                        );
                    },
                },
                templateUrl: '../psicoFatture/components/generate-invoice.html',
                controller: 'GenerateInvoiceController'})
            .when('/update-patient', {
                resolve: {
                    check: function ($location, LoginService) {
                        LoginService.isLogged().then(
                            function (response) {
                                if (!response.data.response){
                                    $location.path('/');
                                }
                            }
                        );
                    },
                },
                templateUrl: '../psicoFatture/components/update-patient.html',
                controller: 'UpdatePatientController'})
            .otherwise({
                template: '404'
            });

        //Configuration for the format of the date
        $mdDateLocaleProvider.formatDate = function (date) {
            return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        }
    });

    //CONTROLLERS
    app.controller('LoginController', LoginController);
    app.controller('HomeNavController', HomeNavController);
    app.controller('HomeController', HomeController);
    app.controller('LastInvoicesController', LastInvoicesController);
    app.controller('GenerateInvoiceController', GenerateInvoiceController);
    app.controller('PatientsController', PatientsController);
    app.controller('UpdatePatientController', UpdatePatientController);
    app.controller('DialogController', DialogController);

    //SERVICES
    app.service('LoginService', LoginService);
    app.service('HomeService', HomeService);
    app.service('PatientsService', PatientsService);
    app.service('DialogService', DialogService);

    /**
     * Function that handle the login page
     * @type {string[]}
     */
    LoginController.$inject = ["$scope", '$location', 'LoginService'];
    function LoginController($scope, $location,  LoginService) {
        $scope.email = '';
        $scope.password = '';
        $scope.noConnection = false;
        $scope.wrongData = false;

        $scope.login = function(form){
            form.$submitted = 'true';

            let promise = LoginService.login($scope.email, $scope.password);

            promise.then(
                function (response) {
                    if (response.data.response) {
                        $location.path('/home');
                    }else {
                        $scope.wrongData = true;
                        $scope.noConnection = false;
                    }
                }
            ).catch(
                function () {
                    $scope.wrongData = false;
                    $scope.noConnection = true;
                }
            )
        };
    }

    /**
     * Function that handle the navbar
     * @type {string[]}
     */
    HomeNavController.$inject = ['$scope', '$location', '$mdDialog', 'LoginService', 'DialogService'];
    function HomeNavController($scope, $location, $mdDialog, LoginService, DialogService){
        $scope.generateInvoice = function () {
            $location.path('/generate-invoice')
        };

        $scope.insertPatient = function (event) {
            $mdDialog.show({
                templateUrl: '../psicoFatture/components/insert-patient-dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen,
                controller: ['$scope', 'PatientsService', function ($scope, PatientsService) {
                    //TODO I should create a service that handle the common actions on all dialogs
                    $scope.patient = {
                        name: '',
                        surname: '',
                        street: '',
                        fiscal_code: '',
                        p_iva: '',
                    };

                    $scope.insertPatient = function(form){
                        form.$submitted = 'true';
                        if (form.$valid) {
                            let promise = PatientsService.insertPatient($scope.patient);

                            promise.then(
                                function (response) {
                                    if (response.data.response){
                                        DialogService.showDialog('success-insert-dialog', $mdDialog);
                                    }else {
                                        DialogService.showDialog('error-insert-dialog', $mdDialog);
                                    }
                                }
                            )
                        }
                    };

                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                }]
            })
            .then(function (answer) {
                //TODO Show success
            }, function () {
                //TODO Show error
            })
        };

        $scope.updatePatient = function () {
            $location.path('/update-patient');
        };

        $scope.logout = function () {
            let promise = LoginService.logout();

            promise.then(
                function (response) {
                    if (response.data.response)
                        $location.path('/');
                }
            )
        }
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
                }
            }
        )
    }

    /**
     * Function that handles the toolbar on the generate-invoce page
     * @type {string[]}
     */
    GenerateInvoiceController.$inject = ['$scope', '$location'];
    function GenerateInvoiceController($scope, $location){
        $scope.home = function () {
            $location.path('/home')
        };


    }

    /**
     * Function that haldles the patients
     * @type {string[]}
     */
    PatientsController.$inject = ['$scope', '$mdDialog', 'PatientsService', 'DialogService'];
    function PatientsController($scope, $mdDialog, PatientsService, DialogService){
        $scope.patients = [];
        //TODO Maibe it doesn't serve
        $scope.status = ' ';
        $scope.customFullscreen = false;

        //Getting the patients
        let promise = PatientsService.getPatients();

        promise.then(
            function (response) {
                if (response.data.response){
                    console.log('patients');
                    console.log(response.data.result);
                    $scope.patients = response.data.result;
                }
            }
        );

        //Function that handles the dialog for the invoice values
        $scope.generateInvoiceDialog = function(event, id){

            $mdDialog.show({
                locals: {passedPatient: $scope.patients[id - 1]},
                templateUrl: '../psicoFatture/components/generate-invoice-dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen,
                controller: ['$scope', 'passedPatient', 'PatientsService', function ($scope, passedPatient, PatientsService) {
                    $scope.patient = Object.create(passedPatient);
                    $scope.patient.description = '';
                    $scope.patient.city  = $scope.patient.street.split('-')[1].trim() + ' - ' + $scope.patient.street.split('-')[2];
                    $scope.patient.street = $scope.patient.street.split('-')[0];
                    let promise = PatientsService.getInvoiceNumber();
                    promise.then(
                        function (response) {
                            if (response.data.response) {
                                console.log(response.data.result);
                                $scope.patient.number = parseInt(response.data.result) + 1;
                            }

                        }
                    );

                    $scope.patient.sum = 60;
                    $scope.patient.date = new Date().toJSON().slice(0, 10);
                    $scope.patient.patientId = passedPatient['number'];

                    $scope.hide = function(){
                        $mdDialog.hide();
                    };

                    //Function that generates the invoice pdf
                    $scope.generateInvoice = function (form){
                        form.$submitted = 'true';
                        if (form.$valid){
                            let date = new Date($scope.patient.date);
                            $scope.patient.date = date.toJSON().slice(0, 10);
                            let promise = PatientsService.insertInvoice($scope.patient);

                            promise.then(
                                function (response) {
                                    if (response.data.response) {
                                        PatientsService.generateInvoicePdf($scope.patient);
                                        $mdDialog.hide();
                                        DialogService.showDialog('success-invoice', $mdDialog);
                                    }else {
                                        if (response.data.message === 'duplicate invoice')
                                            DialogService.showDialog('error-duplicate-invoice', $mdDialog);
                                        else
                                            DialogService.showDialog('error-invoice', $mdDialog);
                                    }
                                }
                            )
                        }
                    }
                }]
            })
            .then(function (answer) {
               //TODO Show success
            }, function () {
                //TODO Show error
            })
        };
    }

    UpdatePatientController.$inject = ['$scope', '$location', '$mdDialog', 'PatientsService', 'DialogService'];
    function UpdatePatientController($scope, $location, $mdDialog, PatientsService, DialogService){
        $scope.patients = [];

        //Getting the patients
        let promise = PatientsService.getPatients();

        promise.then(
            function (response) {
                if (response.data.response){
                    $scope.patients = response.data.result;
                }
            }
        );

        //Function that handle the updating of the patient
        $scope.updatePatientDialog = function (event, id) {
            $mdDialog.show({
                locals: {passedPatient: $scope.patients[id - 1]},
                templateUrl: '../psicoFatture/components/update-patient-dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen,
                controller: ['$scope', 'passedPatient', 'PatientsService', function ($scope, passedPatient, PatientsService) {
                    $scope.patient = Object.assign({}, passedPatient);

                    $scope.hide = function(){
                        $mdDialog.hide();
                    };

                    //Function that generates the invoice pdf
                    $scope.updatePatient = function (form){
                        if (form){
                            let promise = PatientsService.updatePatient($scope.patient);
                            promise.then(
                                function (response) {
                                    if (response.data.response){
                                        PatientsService.getPatients().then(
                                            function (response) {
                                                if (response.data.response) {
                                                    $scope.patients = response.data.result;
                                                    $mdDialog.hide();
                                                    DialogService.showDialog('success-update-dialog', $mdDialog);
                                                }else {
                                                    DialogService.showDialog('error-update-dialog', $mdDialog);
                                                }
                                            }
                                        )
                                    }
                                }
                            )
                        }
                    }
                }]
            })
            .then(function (answer) {
                //TODO Show success
            }, function () {
                //TODO Show error
            })
        };

        //Function that removes a patient
        $scope.removePatient = function(id){
            DialogService.showConfirm('confirm-dialog', $mdDialog);
            DialogService.id = id;
        };

        $scope.home = function () {
            $location.path('/home')
        }
    }

    /**
     * Function that handles the dialog window
     * @type {string[]}
     */
    DialogController.$inject = ['$scope', '$mdDialog', 'DialogService', 'PatientsService'];
    function DialogController($scope, $mdDialog, DialogService, PatientsService){
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.reload = function () {
            location.reload();
        };

        $scope.removePatientConfirm = function () {
            console.log(DialogService.id);
            let promise = PatientsService.removePatient(DialogService.id);

            promise.then(
                function (response) {
                    if (response.data.response){
                        PatientsService.getPatients().then(
                            function (response) {
                                if (response.data.response) {
                                    PatientsService.patients = response.data.result;
                                    location.reload();
                                }
                            }
                        )
                    }else {
                        $mdDialog.hide();
                        DialogService.showDialog('error-delete-dialog', $mdDialog);
                    }
                }
            );
        }
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
                url   : '../psicoFatture/php/ajax/login.php',
                params: {email: email, password: password},
            });
        };

        //Function that controls if the user has an open session
        service.isLogged = function () {
            return $http({
                method: 'GET',
                url   : '../psicoFatture/php/ajax/control_login.php',
            })
        };

        //Function that remeve the user session
        service.logout = function () {
            return $http({
                method: 'GET',
                url   : '../psicoFatture/php/ajax/logout.php',
            })
        }
    }

    /**
     * Service that retrieve the last 10 invoices
     * @type {string[]}
     */
    HomeService.$inject = ['$http'];
    function HomeService($http) {
        let service = this;

        service.getLastInvoces = function () {
            return $http({
                method: 'GET',
                url: '../psicoFatture/php/ajax/get_last_invoices.php'
            });
        }
    }

    /**
     * Service that handles the patients
     * @type {string[]}
     */
    PatientsService.$inject = ['$http', '$filter'];
    function PatientsService($http, $filter) {
        let service = this;
        service.patients = [];

        service.insertPatient = function(data){
            return $http({
                method: 'POST',
                url   : '../psicoFatture/php/ajax/insert_patient.php',
                params: {patient: data},
            });
        };

        service.updatePatient = function(data){
          return $http({
              method: 'POST',
              url   : '../psicoFatture/php/ajax/update_patient.php',
              params: {patient: data}
          })
        };

        service.removePatient = function(id){
            return $http({
                method: 'POST',
                url   : '../psicoFatture/php/ajax/remove_patient.php',
                params: {id: id}
            })
        };

        service.getInvoiceNumber = function(){
            return $http({
                method: 'POST',
                url   : '../psicoFatture/php/ajax/get_invoice_number.php',
            })
        };

        service.insertInvoice = function(data){
            return $http({
                method: 'POST',
                url   : '../psicoFatture/php/ajax/insert_invoice.php',
                params: {patient: data}
            })
        };

        service.generateInvoicePdf = function(patient){
            let totalCost = patient['sum'];
            let encounterCost;
            let logoImage = 'data:image/png;base64,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';
            let text;
            let textWidth;
            let initInsert;
            let date = patient.date.split('-');
            // noinspection JSPotentiallyInvalidConstructorUsage
            let doc = new jsPDF('p', 'pt', 'a4');

            doc.setFont('Helvetica');
            doc.setFillColor(255, 255, 255);
            doc.rect(20, 20, 555, 802, 'FD');

            doc.setFillColor(204, 205, 206);
            doc.rect(20, 20, 555, 83, 'FD');

            doc.setFontSize(10);
            doc.addImage(logoImage, 'JPEG', 40, 30, 60, 60);
            doc.text('Dott.ssa Simona Bettoli - Psicologa', 100, 35);
            doc.text('Via XXV Aprile 8/6 -16123 Genova', 105, 49);
            doc.text('Tel. 333 8737231', 110, 61);
            doc.text('P.IVA: 02458670995', 107, 75);
            doc.text('C.F: BTTSMN81H43D969Z', 100, 89);

            doc.setFontStyle('bold');
            doc.text('FATTURA', 40, 150);
            doc.text('Nr: ', 40, 170);
            doc.setFontStyle('normal');
            doc.text(patient.number + ' / 2019', 60, 170);
            doc.setFontStyle('bold');
            doc.text('Data: ', 40, 190);
            doc.setFontStyle('normal');
            doc.text(date[2] + '/' + date[1] + '/' + date[0], 70, 190);

            doc.setFontSize(14);
            doc.setFontStyle('bold');

            text = patient.name + ' ' + patient.surname;
            textWidth = doc.getTextDimensions(text);
            initInsert = (555 - textWidth.w);
            doc.text(text, initInsert, 220);

            //TODO splittare la stringa in modo da riuscire a inserire la citta' giusta
            doc.setFontSize(10);
            doc.setFontStyle('normal');
            text = patient.street;
            textWidth = doc.getTextDimensions(text);
            initInsert = (555 - textWidth.w);
            doc.text(text, initInsert + 7, 240);

            text = patient.city;
            textWidth = doc.getTextDimensions(text);
            initInsert = (555 - textWidth.w);
            doc.text(text, initInsert, 260);

            text = 'C.F: ' + patient.fiscal_code;
            textWidth = doc.getTextDimensions(text);
            initInsert = (555 - textWidth.w);
            doc.text(text, initInsert + 7, 280);

            doc.setFillColor(204, 205, 206);
            doc.setFillColor(204, 205, 206);
            doc.rect(30, 300, 535, 20, 'FD');

            doc.text('Descrizione', 200, 313);

            doc.setFillColor(204, 205, 206);
            doc.rect(410, 300, 155, 20, 'FD');

            doc.text('Importo', 470, 313);

            doc.setFillColor(255, 255, 255);
            doc.rect(30, 320, 535, 200, 'FD');

            doc.setFillColor(255, 255, 255);
            doc.rect(410, 320, 155, 200, 'FD');

            doc.setFillColor(255, 255, 255);
            doc.rect(410, 500, 155, 20, 'FD');

            doc.setFontSize(11);
            text = 'Colloquio psicologico';
            textWidth = doc.getTextDimensions(text);
            initInsert = (555 - textWidth.w - 160);
            doc.text(text, initInsert, 340);

            doc.text('euro', 420, 340);
            encounterCost = ((50/51) * totalCost).toFixed(2);
            text = '' + encounterCost;
            textWidth = doc.getTextDimensions(text);
            initInsert = (555 - textWidth.w);
            doc.text(text, initInsert, 340);

            doc.setFontSize(11);
            text = 'Contributo integrativo ENPAP 2%';
            textWidth = doc.getTextDimensions(text);
            initInsert = (555 - textWidth.w - 160);
            doc.text(text, initInsert, 380);

            doc.text('euro', 420, 380);
            text = '' + (totalCost - encounterCost).toFixed(2);
            textWidth = doc.getTextDimensions(text);
            initInsert = (555 - textWidth.w);
            doc.text(text, initInsert, 380);

            doc.setFontSize(12);
            doc.setFontStyle('bold');
            text = 'Totale';
            textWidth = doc.getTextDimensions(text);
            initInsert = (555 - textWidth.w - 170);
            doc.text(text, initInsert, 515);

            doc.text("euro", 420, 515);
            text = '' + patient['sum'];
            textWidth = doc.getTextDimensions(text);
            initInsert = (555 - textWidth.w + 5);
            doc.text(text, initInsert, 515);

            doc.setFontSize(11);
            doc.setFontStyle('normal');
            doc.text('Operazione in franchigia da IVA come disposto dalla Legge n. 190 del 23.12.2014 art.1 co. 5489', 80, 800);

            let blobPdf = doc.output('datauri');
            let formData = new FormData();
            formData.append('pdf', blobPdf);
            formData.append('email', patient.email);

            let promise = httpPost('../psicoFatture/php/ajax/send_email_pdf.php', formData);

            promise.then(
                function (response) {
                    if (response.result)
                        console.log('sended');
                    else console.log('not sended');
                }
            );

            doc.save('Fattura.pdf');
        };

        service.getPatients = function () {
            return $http({
                method: 'GET',
                url: '../psicoFatture/php/ajax/get_patients.php'
            });
        }
    }

    /**
     * Service that handle the dialog wondow
     * @type {string[]}
     */
    function DialogService() {
        let service = this;
        // noinspection BadExpressionStatementJS
        service.id;

        service.showDialog = function (template, dialog) {
            dialog.show({
                templateUrl        : '../psicoFatture/components/' + template + '.html',
                parent             : angular.element(document.body),
                controller         : 'DialogController',
                clickOutsideToClose: true,
            })
        };

        service.showConfirm = function(template, dialog) {
            let dialogElement = document.querySelector('success-title');
            console.log(dialogElement);
            dialog.show({
                templateUrl        : '../psicoFatture/components/' + template + '.html',
                parent             : angular.element(document.body),
                controller         : 'DialogController',
                clickOutsideToClose: true,
            })
        };
    }

    function httpPost(url, input) {

        return new Promise(function (resolve, reject) {
            let httpReq = new XMLHttpRequest();
            httpReq.open('POST', url, true);
            httpReq.onreadystatechange = function () {
                if(httpReq.readyState === 4){
                    if(httpReq.status === 200){
                        resolve(JSON.parse(httpReq.responseText));
                    }else{
                        reject(httpReq.statusText);
                    }
                }
            };
            httpReq.send(input);
        });
    }

})();