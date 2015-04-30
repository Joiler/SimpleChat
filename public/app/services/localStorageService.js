angular.module('simpleChatApp')
    .factory('localStorageService',
    ['$timeout',
        function ($timeout) {
            'use strict';

            var setItem = function (key, value) {
                if (localStorage) {
                    localStorage.setItem(key, value);
                }
            }

            var addListener = function(callback) {
                if (window.addEventListener) {
                    window.addEventListener('storage', callback, false);
                } else {
                    window.attachEvent('onstorage', callback);
                };
            }

            return {
                setItem: setItem,
                addListener: addListener
            };
        }]);