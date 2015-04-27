angular.module('simpleChatApp')
    .factory('chatSocketService',
    ['socketFactory', '$location',
        function (socketFactory, $location) {
            var chatSocketFactory = socketFactory();

            return chatSocketFactory;
        }]);