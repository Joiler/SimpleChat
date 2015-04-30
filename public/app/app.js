var app = angular.module('simpleChatApp', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'btford.socket-io'])
    .config(['$routeProvider', function ($routeProvider) {
        'use strict';

        var logCheckOnChatPage = function ($q, $rootScope, $location, authentificationService) {
            var defered = $q.defer();
            if ($rootScope.userInfo && $rootScope.userInfo.username) {
                defered.resolve();
            }
            else {
                authentificationService.isLoggedIn().then(function (data) {
                    if (data.success === true) {
                        $rootScope.userInfo = {username: data.username};
                        defered.resolve();
                    }
                    else {
                        defered.reject();
                        $location.path('/login');
                    }
                })
            }
            return defered.promise;
        }

        var logCheckOnLoginPage = function ($q, $rootScope, $location, authentificationService) {
            var defered = $q.defer();
            if ($rootScope.userInfo && $rootScope.userInfo.username) {
                defered.reject();
                $location.path('/chat');
            }
            else {
                authentificationService.isLoggedIn().then(function (data) {
                    if (data.success === true) {
                        $rootScope.userInfo = {username: data.username};
                        defered.reject();
                        $location.path('/chat');
                    }
                    else {
                        defered.resolve();
                    }
                })
            }
            return defered.promise;
        }

        $routeProvider
            .when('/', {
                redirectTo: '/login'
            })
            .when('/login', {
                templateUrl: 'app/templates/login.html',
                controller: 'loginController',
                resolve: {
                    'logCheck': logCheckOnLoginPage
                }
            })
            .when('/chat', {
                templateUrl: 'app/templates/chat.html',
                controller: 'chatController',
                resolve: {
                    'logCheck': logCheckOnChatPage
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);

app.run(['$rootScope', '$location', 'authentificationService', 'chatSocketService', 'localStorageService',
    function ($rootScope, $location, authentificationService, chatSocketService, localStorageService) {

        var onLogOut = function(event) {
            if (event) {
                if (event.key === 'isLogged' && event.newValue === 'false') {
                    $rootScope.userInfo = undefined;
                    chatSocketService.disconnect();
                    $rootScope.$apply(function() {
                        $location.path('/login');
                    });
                }
                else if (event.key === 'isLogged' && event.newValue === 'true') {
                    $rootScope.$apply(function() {
                        $location.path('/chat');
                    });
                }
            }
        };

        localStorageService.addListener(onLogOut);

        $rootScope.logout = function () {
            chatSocketService.disconnect();
            authentificationService.logout().then(function (data) {
                if (data.success === true) {
                    localStorageService.setItem('isLogged', false);
                    $rootScope.userInfo = undefined;
                    $location.path('/login');
                }
            })
        }
    }]);