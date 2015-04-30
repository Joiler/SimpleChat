angular.module('simpleChatApp')
    .factory('chatSocketService',
    ['socketFactory', '$location',
        function (socketFactory, $location) {
            'use strict';

            var chatSocketFactory = socketFactory();

            return chatSocketFactory;
        }]);