angular.module('simpleChatApp')
    .factory('authentificationService',
    ['$http', '$q',
        function ($http, $q) {
            'use strict';

            var login = function (userName, password) {
                var deferred = $q.defer();

                $http.post('/logon', {
                    username: userName,
                    password: password
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            var logout = function () {
                var deferred = $q.defer();

                $http.get('/logout').then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            var isLoggedIn = function () {
                var deferred = $q.defer();

                $http.get('/isLoggedIn').then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            return {
                login: login,
                logout: logout,
                isLoggedIn: isLoggedIn
            };
        }]);